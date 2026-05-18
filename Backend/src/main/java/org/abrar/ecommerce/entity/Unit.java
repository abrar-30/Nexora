package org.abrar.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "units",
        indexes = {
                @Index(name = "idx_unit_name", columnList = "unit_name", unique = true),
                @Index(name = "idx_unit_code", columnList = "unit_code", unique = true)
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Long unitId;

    @NotBlank(message = "Unit name is required")
    @Column(name = "unit_name", nullable = false, unique = true)
    private String unitName;

    @NotBlank(message = "Short name is required")
    @Column(name = "short_name", nullable = false, unique = true, length = 10)
    private String shortName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}