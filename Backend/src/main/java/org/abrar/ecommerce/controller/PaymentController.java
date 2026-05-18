package org.abrar.ecommerce.controller;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.Payment;
import org.abrar.ecommerce.entity.enums.PaymentStatus;
import org.abrar.ecommerce.repository.OrderRepository;
import org.abrar.ecommerce.repository.PaymentRepository;
import org.abrar.ecommerce.service.Payment.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

	private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;
	private final PaymentService paymentService;

	@Value("${stripe.secret.key}")
	private String stripeSecretKey;

	@Value("${stripe.webhook.secret}")
	private String webhookSecret;

	public PaymentController(
			PaymentRepository paymentRepository,
			OrderRepository orderRepository,
			PaymentService paymentService
	) {
		this.paymentRepository = paymentRepository;
		this.orderRepository = orderRepository;
		this.paymentService = paymentService;
	}

	// CREATE STRIPE CHECKOUT SESSION
	@PostMapping("/create-checkout-session/{orderId}")
	public ResponseEntity<?> createCheckoutSession(@PathVariable Long orderId) {

		try {

			Stripe.apiKey = stripeSecretKey;

			Order order = orderRepository.findById(orderId)
					.orElseThrow(() -> new RuntimeException("Order not found"));

			// CREATE PAYMENT ENTRY
			Payment payment = new Payment();
			payment.setOrder(order);
			// paymentMethod stored as String in entity elsewhere
			payment.setPaymentMethod("STRIPE");
			payment.setPaymentStatus(PaymentStatus.PENDING);

			payment = paymentRepository.save(payment);

			BigDecimal totalAmount = BigDecimal.valueOf(order.getTotalAmount());

			// Stripe amount in paise
			long amount = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();

			SessionCreateParams params =
					SessionCreateParams.builder()
							.setMode(SessionCreateParams.Mode.PAYMENT)

							.setSuccessUrl(
									"http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}"
							)

							.setCancelUrl(
									"http://localhost:5173/payment-failed"
							)

							// IMPORTANT
							.putMetadata("paymentId", payment.getPaymentId().toString())
							.putMetadata("orderId", order.getOrderId().toString())

							.addLineItem(
									SessionCreateParams.LineItem.builder()
											.setQuantity(1L)
											.setPriceData(
													SessionCreateParams.LineItem.PriceData.builder()
															.setCurrency("inr")
															.setUnitAmount(amount)
															.setProductData(
																	SessionCreateParams.LineItem.PriceData.ProductData.builder()
																			.setName("Order #" + order.getOrderNumber())
																			.build()
															)
															.build()
											)
											.build()
							)
							.build();

			Session session = Session.create(params);

			Map<String, Object> response = new HashMap<>();

			response.put("orderId", order.getOrderId());
			response.put("orderNumber", order.getOrderNumber());
			response.put("paymentUrl", session.getUrl());

			response.put("payment", Map.of(
					"paymentId", payment.getPaymentId(),
					"paymentMethod", payment.getPaymentMethod(),
					"paymentStatus", payment.getPaymentStatus()
			));

			return ResponseEntity.ok(response);

		} catch (StripeException e) {

			log.error("Stripe error", e);

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Stripe session creation failed");
		}
	}

	// STRIPE WEBHOOK
	@PostMapping("/webhook")
	public ResponseEntity<String> handleWebhook(HttpServletRequest request) {
		try {
			byte[] payloadBytes = request.getInputStream().readAllBytes();
			String payload = new String(payloadBytes, StandardCharsets.UTF_8);
			String signatureHeader = request.getHeader("Stripe-Signature");

			log.info("🔔 Webhook received with signature header: {}", signatureHeader != null ? "Present" : "Missing");

			if (signatureHeader == null || signatureHeader.isBlank()) {
				return ResponseEntity.badRequest().body("Missing Stripe-Signature header");
			}

			Event event = Webhook.constructEvent(payload, signatureHeader, webhookSecret);
			log.info("✅ Event signature verified. Event type: {}", event.getType());

			if (!"checkout.session.completed".equals(event.getType())) {
				log.info("⏭️ Ignoring event type: {}", event.getType());
				return ResponseEntity.ok("Ignored");
			}

			log.info("🎯 Processing checkout.session.completed event");

			Optional<StripeObject> stripeObjectOpt = event.getDataObjectDeserializer().getObject();
			Session session = null;
			if (stripeObjectOpt.isPresent()) {
				Object obj = stripeObjectOpt.get();
				if (obj instanceof Session) {
					session = (Session) obj;
					log.info("✅ Deserialized Session object via SDK");
				} else {
					log.warn("⚠️ Data object deserialized by SDK is not a Session: {}", obj != null ? obj.getClass().getSimpleName() : "null");
				}
			}

			// If SDK deserialization didn't produce a Session, try JSON fallback
			if (session == null) {
				log.warn("⚠️ Stripe webhook payload was not a checkout session via SDK, trying JSON fallback");
				try {
					ObjectMapper mapper = new ObjectMapper();
					JsonNode root = mapper.readTree(payload);
					JsonNode dataObj = root.path("data").path("object");
					String paymentIdStr = null;
					String transactionId = null;
					if (dataObj.has("metadata") && dataObj.get("metadata").has("paymentId")) {
						paymentIdStr = dataObj.get("metadata").get("paymentId").asText(null);
					}
					if (dataObj.has("payment_intent")) {
						transactionId = dataObj.get("payment_intent").asText(null);
					}

					if (paymentIdStr != null) {
						Long paymentId = Long.parseLong(paymentIdStr);
						log.info("🔄 Fallback: calling paymentService.markPaymentSuccess(paymentId={}, transactionId={})", paymentId, transactionId);
						paymentService.markPaymentSuccess(paymentId, transactionId);
						log.info("✅ Payment marked successful (fallback) for paymentId={}", paymentId);
						return ResponseEntity.ok("Success (fallback)");
					} else {
						log.warn("⚠️ JSON fallback could not find paymentId in payload");
						return ResponseEntity.ok("Ignored");
					}
				} catch (Exception je) {
					log.error("❌ JSON fallback parse error", je);
					return ResponseEntity.ok("Ignored");
				}
			}

			// Proceed with SDK Session
			log.info("📋 Session ID: {}, Amount: {}, Currency: {}", session.getId(), session.getAmountTotal(), session.getCurrency());

			Map<String, String> metadata = session.getMetadata();
			log.info("📦 Metadata: {}", metadata);

			if (metadata == null || !metadata.containsKey("paymentId")) {
				log.error("❌ Missing paymentId metadata for Stripe session {}", session.getId());
				return ResponseEntity.badRequest().body("Missing paymentId metadata");
			}

			String paymentIdStr = metadata.get("paymentId");
			log.info("💳 Extracted paymentId from metadata: {}", paymentIdStr);

			Long paymentId;
			try {
				paymentId = Long.parseLong(paymentIdStr);
				log.info("✓ Parsed paymentId: {}", paymentId);
			} catch (NumberFormatException ex) {
				log.error("❌ Invalid paymentId metadata value: {}", paymentIdStr, ex);
				return ResponseEntity.badRequest().body("Invalid paymentId metadata");
			}

			log.info("🔄 Calling paymentService.markPaymentSuccess({}, ...)", paymentId);
			paymentService.markPaymentSuccess(paymentId, session);

			log.info("✅ Payment marked successful for paymentId={}", paymentId);
			return ResponseEntity.ok("Success");

		} catch (SignatureVerificationException ex) {
			log.error("❌ Invalid Stripe webhook signature", ex);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
		} catch (Exception ex) {
			log.error("❌ Webhook error occurred", ex);
			ex.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook error: " + ex.getMessage());
		}
	}
}


