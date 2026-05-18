import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { addressService } from "../api/addressService";
import { cartService } from "../api/cartService";
import { orderService } from "../api/orderService";
import { productService } from "../api/productService";
import { getUserId } from "../utils/tokenHelpers";

const TAX_RATE = 12;

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return `₹${moneyFormatter.format(Number(value) || 0)}`;
}

function calculateTax(amount, taxRate = TAX_RATE) {
  const baseAmount = Number(amount) || 0;
  return Math.round((baseAmount * taxRate) / 100);
}

function pickData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [checkoutData, setCheckoutData] = useState({
    source: "cart",
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalPrice: 0,
  });
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    let active = true;

    const loadCheckoutData = async () => {
      setLoading(true);

      try {
        const [addressResponse, orderSource] = await Promise.all([
          addressService.getAll(),
          loadOrderSource(productId, variantId),
        ]);

        if (!active) return;

        const savedAddresses = pickData(addressResponse) || [];

        setAddresses(savedAddresses);
        setCheckoutData(orderSource);

        setSelectedAddressId((currentSelectedId) => {
          if (currentSelectedId) return currentSelectedId;

          const defaultAddress =
            savedAddresses.find((address) => address.isDefault) ||
            savedAddresses[0];

          return defaultAddress ? String(defaultAddress.addressId) : "";
        });
      } catch {
        toast.error("Failed to load checkout details");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCheckoutData();

    return () => {
      active = false;
    };
  }, [productId, variantId]);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (address) => String(address.addressId) === selectedAddressId,
      ),
    [addresses, selectedAddressId],
  );

  const customerName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (checkoutData.items.length === 0) {
      toast.error("Your checkout is empty");
      return;
    }

    try {
      setPlacingOrder(true);
      const userId = user?.id ?? user?.userId ?? getUserId();

      if (!userId) {
        toast.error("Unable to determine user ID for checkout");
        return;
      }

      const orderPayload = {
        ...(userId ? { userId } : {}),
        totalAmount: Number(checkoutData.totalPrice) || 0,
        taxableAmount: Number(checkoutData.taxAmount) || 0,
        orderStatus: "PENDING",
        shippingAddress: buildShippingAddress(selectedAddress, customerName || user?.email),
        orderItems: buildOrderItems(checkoutData.items),
        orderNote: orderNote.trim() || undefined,
      };

      const createdOrder = await orderService.create(orderPayload);
      const paymentUrl = createdOrder?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Payment URL was not returned by the server");
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to place order";
      toast.error(serverMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Spinner />;

  if (checkoutData.items.length === 0) {
    return (
      <div className="text-center py-24 max-w-xl mx-auto">
        <div className="text-6xl mb-4">🧾</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nothing to checkout
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Add items to your cart before starting checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <p className="text-sm text-indigo-600 font-medium">Checkout</p>
        <h1 className="text-3xl font-bold text-gray-900">Confirm your order</h1>
        <p className="text-sm text-gray-500">
          Standard delivery is applied by default. Stripe will handle the final
          payment step.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipping Address
                </h2>
                <p className="text-sm text-gray-500">
                  Choose the address where this order should be delivered.
                </p>
              </div>
              <Link
                to="/profile"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Manage addresses
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-600">
                No saved addresses found. Add one in your profile before placing
                the order.
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected =
                    String(address.addressId) === selectedAddressId;

                  return (
                    <label
                      key={address.addressId}
                      className={`block cursor-pointer rounded-2xl border p-4 transition ${
                        isSelected
                          ? "border-indigo-300 bg-indigo-50/40"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping-address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(String(address.addressId))}
                          className="mt-1 h-4 w-4 accent-indigo-600"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {address.addressLine1}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>

                          {address.addressLine2 && (
                            <p className="text-sm text-gray-500">
                              {address.addressLine2}
                            </p>
                          )}

                          <p className="text-sm text-gray-500 mt-1">
                            {[address.cityName, address.stateName, address.countryName]
                              .filter(Boolean)
                              .join(", ")}
                            {address.postalCode ? ` - ${address.postalCode}` : ""}
                          </p>

                          {address.phoneNumber && (
                            <p className="text-sm text-gray-400 mt-1">
                              {address.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Contact Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <DetailField label="Customer" value={customerName || "—"} />
              <DetailField label="Email" value={user?.email || "—"} />
              <DetailField
                label="Phone"
                value={selectedAddress?.phoneNumber || "—"}
              />
              <DetailField
                label="Payment"
                value="Stripe secure checkout"
              />
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Review
                </h2>
                <p className="text-sm text-gray-500">
                  Review the products before continuing to payment.
                </p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                {checkoutData.items.length} item{checkoutData.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {checkoutData.items.map((item) => (
                <CheckoutItem key={item.productVariantId} item={item} />
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Order Note
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add any short instruction you want to keep with the order.
            </p>

            <textarea
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
              rows={4}
              placeholder="Example: Leave the package at the reception if I am unavailable."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <p className="text-sm text-gray-500 mt-1">
                Final totals from your cart or selected item.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <SummaryRow
                label={`Subtotal (${checkoutData.items.length} item${checkoutData.items.length !== 1 ? "s" : ""})`}
                value={formatCurrency(checkoutData.subtotal)}
              />
              <SummaryRow
                label="Tax"
                value={formatCurrency(checkoutData.taxAmount)}
              />
              <SummaryRow label="Delivery" value="Free" valueClassName="text-green-600 font-medium" />

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(checkoutData.totalPrice)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-900">
              Stripe will be used for payment. Once your backend creates the
              checkout session, this button sends the customer to Stripe and
              then back to the success page.
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddress}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition cursor-pointer"
            >
              {placingOrder ? "Preparing Stripe Checkout..." : "Proceed to Stripe Checkout"}
            </button>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                Back to cart
              </button>
              <Link to="/products" className="text-indigo-600 hover:underline">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function loadOrderSource(productId, variantId) {
  if (!productId) {
    const cartResponse = await cartService.getCart();
    const cartData = pickData(cartResponse) || {};
    const items = (cartData.cartItems || []).map((item) => ({
      ...item,
      taxRate: TAX_RATE,
    }));

    return {
      source: "cart",
      items,
      subtotal: Number(cartData.subtotal) || 0,
      taxAmount: Number(cartData.taxAmount) || 0,
      totalPrice: Number(cartData.totalPrice) || 0,
    };
  }

  let product = null;
  let variant = null;

  if (variantId) {
    const variantResponse = await productService.getVariantById(variantId);
    variant = pickData(variantResponse);
  }

  const productResponse = await productService.getById(
    variant?.productId || productId,
  );
  product = pickData(productResponse);

  const unitPrice = Number(
    variant?.variantPrice ?? product?.unitPrice ?? product?.basePrice ?? 0,
  );
  const taxAmount = calculateTax(unitPrice, product?.taxPercentage ?? TAX_RATE);

  return {
    source: "product",
    items: [
      {
        productVariantId: variant?.variantId || variantId || productId,
        productName:
          product?.productName || product?.name || "Selected product",
        unitPrice,
        quantity: 1,
        taxRate: product?.taxPercentage ?? TAX_RATE,
        imageUrl: product?.mainImageUrl || null,
      },
    ],
    subtotal: unitPrice,
    taxAmount,
    totalPrice: unitPrice + taxAmount,
  };
}

function CheckoutItem({ item }) {
  const taxRate = Number(item.taxRate ?? TAX_RATE);
  const unitPriceWithTax = Number(item.unitPrice || 0) + calculateTax(item.unitPrice, taxRate);
  const lineTotal = unitPriceWithTax * Number(item.quantity || 1);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">
            📦
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-gray-900">{item.productName}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {formatCurrency(unitPriceWithTax)} per item
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(lineTotal)}
        </p>
        <p className="text-xs text-gray-500">Qty {item.quantity}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-gray-900" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-gray-600">
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function buildShippingAddress(address, shippingName) {
  return {
    shippingName: shippingName || address.addressLine1,
    shippingAddressLine1: address.addressLine1,
    shippingAddressLine2: address.addressLine2 || "",
    shippingCity: address.cityName,
    shippingState: address.stateName,
    shippingPostalCode: address.postalCode,
    shippingCountry: address.countryName,
    shippingPhone: address.phoneNumber,
  };
}

function buildOrderItems(items) {
  return items.map((item) => ({
    variantId: Number(item.productVariantId),
    quantity: Number(item.quantity) || 1,
    priceAtPurchase: Number(item.unitPrice) || 0,
  }));
}