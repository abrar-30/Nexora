package org.abrar.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions",
        indexes = {
                @Index(name = "idx_tx_variant_id", columnList = "variant_id"),
                @Index(name = "idx_tx_created_at", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long stockTransactionId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false, updatable = false)
    private ProductVariant productVariant;

    @NotNull
    @Min(value = 0, message = "In-quantity cannot be negative")
    @Column(name = "in_quantity", nullable = false, updatable = false)
    private Double inQuantity = 0.0;

    @NotNull
    @Min(value = 0, message = "Out-quantity cannot be negative")
    @Column(name = "out_quantity", nullable = false, updatable = false)
    private Double outQuantity = 0.0;

    @Column(name = "description", length = 500, updatable = false)
    private String description;

    @Column(name = "landing_cost")
    private Double landingCost;

    @Column(name = "selling_price")
    private Double sellingPrice;// change to double, add order id, type wise

    @Column(name = "order_id")
    private Long orderId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}