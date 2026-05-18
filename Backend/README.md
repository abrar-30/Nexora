# Ecommerce Backend (Spring Boot)

Backend API for ecommerce operations: auth, catalog, inventory, orders, reviews, and master data.

## 1) Project Structure

```text
Ecommerce/
|- HELP.md
|- pom.xml
|- mvnw
|- mvnw.cmd
|- src/
|  |- main/
|  |  |- java/org/abrar/ecommerce/
|  |  |  |- EcommerceApplication.java
|  |  |  |- config/
|  |  |  |  |- CloudinaryConfig.java
|  |  |  |  |- SecurityConfig.java
|  |  |  |- controller/
|  |  |  |  |- Auth/
|  |  |  |  |  |- AuthController.java
|  |  |  |  |- AddressController.java
|  |  |  |  |- BrandController.java
|  |  |  |  |- CartController.java
|  |  |  |  |- CategoryController.java
|  |  |  |  |- CityController.java
|  |  |  |  |- CountryController.java
|  |  |  |  |- OrderController.java
|  |  |  |  |- ProductController.java
|  |  |  |  |- ProductImageController.java
|  |  |  |  |- ProductReviewController.java
|  |  |  |  |- ProductVariantController.java
|  |  |  |  |- StateController.java
|  |  |  |  |- StockMasterController.java
|  |  |  |  |- TaxSlabController.java
|  |  |  |  |- UnitController.java
|  |  |  |  |- test.java
|  |  |  |- dto/
|  |  |  |- entity/
|  |  |  |- exception/
|  |  |  |- repository/
|  |  |  |- security/
|  |  |  |- service/
|  |- resources/
|  |  |- application.properties
|  |  |- static/
|  |  |- templates/
|  |- test/java/org/abrar/ecommerce/
|     |- EcommerceApplicationTests.java
|- target/
```

## 2) High-Level Layers

- `controller`: REST endpoints.
- `dto`: request/response contracts.
- `service`: business logic.
- `repository`: database queries (including native queries where used).
- `entity`: JPA table mappings.
- `security`: JWT filter and auth support.
- `exception`: global and custom exception handlers.

## 3) Security Overview

Current security config in `src/main/java/org/abrar/ecommerce/config/SecurityConfig.java`:

- Public: `/api/v1/auth/**`, `/api/v1/categories/**`, `/api/v1/products/**`
- Protected: all other endpoints require authentication.

Note: All documented endpoints use `/api/v1/...` route versioning.

## 4) Standard API Response

The project includes generic response wrapper `ApiResponse<T>` in
`src/main/java/org/abrar/ecommerce/dto/ApiResponse.java`:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "2026-03-11T10:30:00"
}
```

Methods available:

- `ApiResponse.success(message, data)`
- `ApiResponse.error(message, data)`

Note: Some controllers still return raw DTO directly (without wrapper).

## 5) API Structure (All Controllers)

Base URL example: `http://localhost:8080`

---

### 5.1 Auth APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/Auth/AuthController.java`  
Base path: `/api/v1/auth`

| Method | Endpoint                | Request Body          | Response          |
|--------|-------------------------|-----------------------|-------------------|
| POST   | `/api/v1/auth/register` | `UserRegistrationDTO` | `AuthResponseDTO` |
| POST   | `/api/v1/auth/login`    | `UserLoginDTO`        | `AuthResponseDTO` |

---

### 5.2 Product APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/ProductController.java`  
Base path: `/api/v1/products`

| Method | Endpoint                                 | Query Params                          | Request Body                                                                 | Response                                |
|--------|------------------------------------------|---------------------------------------|------------------------------------------------------------------------------|-----------------------------------------|
| GET    | `/api/v1/products/getAll`                | `page`, `size`, `sortBy`, `direction` | -                                                                            | `ApiResponse<List<ProductResponseDTO>>` |
| GET    | `/api/v1/products/{id}`                  | -                                     | -                                                                            | `ApiResponse<ProductResponseDTO>`       |
| GET    | `/api/v1/products/brand/{brandId}`       | -                                     | -                                                                            | `ApiResponse<List<ProductResponseDTO>>` |
| GET    | `/api/v1/products/category/{categoryId}` | -                                     | -                                                                            | `ApiResponse<List<ProductResponseDTO>>` |
| GET    | `/api/v1/products/price-range`           | `minPrice`, `maxPrice`                | -                                                                            | `ApiResponse<List<ProductResponseDTO>>` |
| GET    | `/api/v1/products/search`                | `keyword`                             | -                                                                            | `ApiResponse<List<ProductResponseDTO>>` |
| POST   | `/api/v1/products/create`                | -                                     | `multipart/form-data` with `requestDTO` (JSON string) + optional `imageFile` | `ApiResponse<ProductResponseDTO>`       |
| PUT    | `/api/v1/products/update/{id}`           | -                                     | `ProductRequestDTO` (+ `MultipartFile imageFile` parameter in signature)     | `ApiResponse<ProductResponseDTO>`       |
| DELETE | `/api/v1/products/delete/{id}`           | -                                     | -                                                                            | `ApiResponse<Void>`                     |

---

### 5.3 Product Variant APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/ProductVariantController.java`  
Base path: `/api/v1/product-variants`

| Method | Endpoint                                              | Request Body               | Response                               |
|--------|-------------------------------------------------------|----------------------------|----------------------------------------|
| POST   | `/api/v1/product-variants/create/{productId}`         | `ProductVariantRequestDTO` | `ApiResponse<ProductVariantDTO>`       |
| GET    | `/api/v1/product-variants/{variantId}`                | -                          | `ApiResponse<ProductVariantDTO>`       |
| GET    | `/api/v1/product-variants/product/{productId}/all`    | -                          | `ApiResponse<List<ProductVariantDTO>>` |
| GET    | `/api/v1/product-variants/product/{productId}/active` | -                          | `ApiResponse<List<ProductVariantDTO>>` |
| PUT    | `/api/v1/product-variants/update/{variantId}`         | `ProductVariantRequestDTO` | `ApiResponse<ProductVariantDTO>`       |
| DELETE | `/api/v1/product-variants/delete/{variantId}`         | -                          | `ApiResponse<Void>`                    |
| GET    | `/api/v1/product-variants/all`                        | -                          | `ApiResponse<List<ProductVariantDTO>>` |

---

### 5.4 Product Image APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/ProductImageController.java`  
Base path: `/api/v1/product-images`

| Method | Endpoint                                             | Request Body                                                                                     | Response                             |
|--------|------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------|
| POST   | `/api/v1/product-images/upload/{variantId}`          | `MultipartFile file` + `ProductImageDTO`                                                         | `ProductImageDTO`                    |
| POST   | `/api/v1/product-images/upload/multiple/{variantId}` | `multipart/form-data` with `files` + optional `metadata` (JSON list of `ProductImageRequestDTO`) | `ApiResponse<List<ProductImageDTO>>` |
| GET    | `/api/v1/product-images/{imageId}`                   | -                                                                                                | `ProductImageDTO`                    |
| GET    | `/api/v1/product-images/variant/{variantId}`         | -                                                                                                | `List<ProductImageDTO>`              |
| GET    | `/api/v1/product-images/variant/{variantId}/active`  | -                                                                                                | `List<ProductImageDTO>`              |
| PUT    | `/api/v1/product-images/{imageId}`                   | `ProductImageRequestDTO`                                                                         | `ProductImageDTO`                    |
| DELETE | `/api/v1/product-images/{imageId}`                   | -                                                                                                | `204 No Content`                     |
| GET    | `/api/v1/product-images/all`                         | -                                                                                                | `List<ProductImageDTO>`              |

---

### 5.5 Product Review APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/ProductReviewController.java`  
Base path: `/api/v1/reviews`

| Method | Endpoint                                             | Request Body       | Response      |
|--------|------------------------------------------------------|--------------------|---------------|
| POST   | `/api/v1/reviews`                                    | `ProductReviewDTO` | `ApiResponse` |
| GET    | `/api/v1/reviews/{reviewId}`                         | -                  | `ApiResponse` |
| GET    | `/api/v1/reviews/product/{productId}`                | -                  | `ApiResponse` |
| GET    | `/api/v1/reviews/user/{userId}`                      | -                  | `ApiResponse` |
| GET    | `/api/v1/reviews/product/{productId}/average-rating` | -                  | `ApiResponse` |
| PUT    | `/api/v1/reviews/{reviewId}`                         | `ProductReviewDTO` | `ApiResponse` |
| DELETE | `/api/v1/reviews/{reviewId}`                         | -                  | `ApiResponse` |
| POST   | `/api/v1/reviews/{reviewId}/mark-helpful`            | -                  | `ApiResponse` |

---

### 5.6 Stock Master APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/StockMasterController.java`  
Base path: `/api/v1/stock-master`

| Method | Endpoint                                                      | Request Body            | Response                            |
|--------|---------------------------------------------------------------|-------------------------|-------------------------------------|
| POST   | `/api/v1/stock-master/create`                                 | `StockMasterRequestDTO` | `ApiResponse<StockMasterDTO>`       |
| GET    | `/api/v1/stock-master/{stockId}`                              | -                       | `ApiResponse<StockMasterDTO>`       |
| GET    | `/api/v1/stock-master/getAll`                                 | -                       | `ApiResponse<List<StockMasterDTO>>` |
| GET    | `/api/v1/stock-master/variant/{variantId}`                    | -                       | `ApiResponse<List<StockMasterDTO>>` |
| GET    | `/api/v1/stock-master/variant/{variantId}/available-quantity` | -                       | `ApiResponse<Double>`               |
| PUT    | `/api/v1/stock-master/update/{stockId}`                       | `StockMasterDTO`        | `ApiResponse<StockMasterDTO>`       |
| DELETE | `/api/v1/stock-master/delete/{stockId}`                       | -                       | `ApiResponse<Void>`                 |

---

### 5.7 Category APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/CategoryController.java`  
Base path: `/api/v1/categories`

| Method | Endpoint                  | Request Body  | Response                         |
|--------|---------------------------|---------------|----------------------------------|
| POST   | `/api/v1/categories`      | `CategoryDTO` | `ApiResponse<CategoryDTO>`       |
| GET    | `/api/v1/categories/{id}` | -             | `ApiResponse<CategoryDTO>`       |
| GET    | `/api/v1/categories`      | -             | `ApiResponse<List<CategoryDTO>>` |
| PUT    | `/api/v1/categories/{id}` | `CategoryDTO` | `ApiResponse<CategoryDTO>`       |
| DELETE | `/api/v1/categories/{id}` | -             | `ApiResponse<Void>`              |

---

### 5.8 Brand APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/BrandController.java`  
Base path: `/api/v1/brands`

| Method | Endpoint              | Request Body | Response         |
|--------|-----------------------|--------------|------------------|
| POST   | `/api/v1/brands`      | `BrandDTO`   | `BrandDTO`       |
| GET    | `/api/v1/brands/{id}` | -            | `BrandDTO`       |
| GET    | `/api/v1/brands`      | -            | `List<BrandDTO>` |
| PUT    | `/api/v1/brands/{id}` | `BrandDTO`   | `BrandDTO`       |
| DELETE | `/api/v1/brands/{id}` | -            | `204 No Content` |

---

### 5.9 Unit APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/UnitController.java`  
Base path: `/api/v1/units`

| Method | Endpoint             | Request Body | Response         |
|--------|----------------------|--------------|------------------|
| POST   | `/api/v1/units`      | `UnitDTO`    | `UnitDTO`        |
| GET    | `/api/v1/units/{id}` | -            | `UnitDTO`        |
| GET    | `/api/v1/units`      | -            | `List<UnitDTO>`  |
| PUT    | `/api/v1/units/{id}` | `UnitDTO`    | `UnitDTO`        |
| DELETE | `/api/v1/units/{id}` | -            | `204 No Content` |

---

### 5.10 Tax Slab APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/TaxSlabController.java`  
Base path: `/api/v1/taxslabs`

| Method | Endpoint                | Request Body | Response           |
|--------|-------------------------|--------------|--------------------|
| POST   | `/api/v1/taxslabs`      | `TaxSlabDTO` | `TaxSlabDTO`       |
| GET    | `/api/v1/taxslabs/{id}` | -            | `TaxSlabDTO`       |
| GET    | `/api/v1/taxslabs`      | -            | `List<TaxSlabDTO>` |
| PUT    | `/api/v1/taxslabs/{id}` | `TaxSlabDTO` | `TaxSlabDTO`       |
| DELETE | `/api/v1/taxslabs/{id}` | -            | `204 No Content`   |

---

### 5.11 Order APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/OrderController.java`  
Base path: `/api/v1/orders`

| Method | Endpoint                              | Request Body | Response         |
|--------|---------------------------------------|--------------|------------------|
| POST   | `/api/v1/orders`                      | `OrderDTO`   | `OrderDTO`       |
| PUT    | `/api/v1/orders/{orderId}`            | `OrderDTO`   | `OrderDTO`       |
| GET    | `/api/v1/orders/{orderId}`            | -            | `OrderDTO`       |
| GET    | `/api/v1/orders`                      | -            | `List<OrderDTO>` |
| GET    | `/api/v1/orders/user/{userId}`        | -            | `List<OrderDTO>` |
| GET    | `/api/v1/orders/number/{orderNumber}` | -            | `OrderDTO`       |
| GET    | `/api/v1/orders/status/{status}`      | -            | `List<OrderDTO>` |
| DELETE | `/api/v1/orders/{orderId}`            | -            | `204 No Content` |

---

### 5.12 Address APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/AddressController.java`  
Base path: `/api/v1/addresses`

| Method | Endpoint                                    | Request Body        | Response                                |
|--------|---------------------------------------------|---------------------|-----------------------------------------|
| POST   | `/api/v1/addresses/create`                  | `AddressRequestDTO` | `ApiResponse<AddressResponseDTO>`       |
| GET    | `/api/v1/addresses/my-addresses`            | -                   | `ApiResponse<List<AddressResponseDTO>>` |
| GET    | `/api/v1/addresses/{addressId}`             | -                   | `ApiResponse<AddressResponseDTO>`       |
| PUT    | `/api/v1/addresses/update/{addressId}`      | `AddressRequestDTO` | `ApiResponse<AddressResponseDTO>`       |
| DELETE | `/api/v1/addresses/delete/{addressId}`      | -                   | `ApiResponse<Void>`                     |
| PATCH  | `/api/v1/addresses/set-default/{addressId}` | -                   | `ApiResponse<AddressResponseDTO>`       |

---

### 5.13 Country APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/CountryController.java`  
Base path: `/api/v1/countries`

| Method | Endpoint                        | Request Body | Response                        |
|--------|---------------------------------|--------------|---------------------------------|
| POST   | `/api/v1/countries/create`      | `CountryDTO` | `ApiResponse<CountryDTO>`       |
| GET    | `/api/v1/countries/{id}`        | -            | `ApiResponse<CountryDTO>`       |
| GET    | `/api/v1/countries/getAll`      | -            | `ApiResponse<List<CountryDTO>>` |
| PUT    | `/api/v1/countries/update/{id}` | `CountryDTO` | `ApiResponse<CountryDTO>`       |
| DELETE | `/api/v1/countries/delete/{id}` | -            | `ApiResponse<Void>`             |

---

### 5.14 State APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/StateController.java`  
Base path: `/api/v1/states`

| Method | Endpoint                             | Request Body | Response                      |
|--------|--------------------------------------|--------------|-------------------------------|
| POST   | `/api/v1/states/create`              | `StateDTO`   | `ApiResponse<StateDTO>`       |
| GET    | `/api/v1/states/{id}`                | -            | `ApiResponse<StateDTO>`       |
| GET    | `/api/v1/states/getAll`              | -            | `ApiResponse<List<StateDTO>>` |
| GET    | `/api/v1/states/country/{countryId}` | -            | `ApiResponse<List<StateDTO>>` |
| PUT    | `/api/v1/states/update/{id}`         | `StateDTO`   | `ApiResponse<StateDTO>`       |
| DELETE | `/api/v1/states/delete/{id}`         | -            | `ApiResponse<Void>`           |

---

### 5.15 City APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/CityController.java`  
Base path: `/api/v1/cities`

| Method | Endpoint                         | Request Body | Response                     |
|--------|----------------------------------|--------------|------------------------------|
| POST   | `/api/v1/cities/create`          | `CityDTO`    | `ApiResponse<CityDTO>`       |
| GET    | `/api/v1/cities/{id}`            | -            | `ApiResponse<CityDTO>`       |
| GET    | `/api/v1/cities/getAll`          | -            | `ApiResponse<List<CityDTO>>` |
| GET    | `/api/v1/cities/state/{stateId}` | -            | `ApiResponse<List<CityDTO>>` |
| PUT    | `/api/v1/cities/update/{id}`     | `CityDTO`    | `ApiResponse<CityDTO>`       |
| DELETE | `/api/v1/cities/delete/{id}`     | -            | `ApiResponse<Void>`          |

---

### 5.16 Cart APIs

Controller: `src/main/java/org/abrar/ecommerce/controller/CartController.java`  
Base path: `/api/v1/cart`

| Method | Endpoint              | Query Params            | Request Body | Response                         |
|--------|-----------------------|-------------------------|--------------|----------------------------------|
| GET    | `/api/v1/cart`        | -                       | -            | `ApiResponse<CartDTO>`           |
| GET    | `/api/v1/cart/items`  | -                       | -            | `ApiResponse<List<CartItemDTO>>` |
| POST   | `/api/v1/cart/manage` | `variantId`, `quantity` | -            | `ApiResponse<CartDTO>`           |
| DELETE | `/api/v1/cart/clear`  | -                       | -            | `ApiResponse<CartDTO>`           |

---

### 5.17 Test Endpoint

Controller: `src/main/java/org/abrar/ecommerce/controller/test.java`

| Method | Endpoint  | Response        |
|--------|-----------|-----------------|
| GET    | `/api/v1` | `"hello abrar"` |

## 6) Quick Run

```bash
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

## 7) Suggested Next Cleanup (Optional)

- Align all controllers to one response style (`ApiResponse<T>`).
- Standardize base paths (prefer `/api/v1/...` for all modules).
- Update security allowlist to match actual endpoint paths.
- Add Swagger/OpenAPI for live API documentation.
- Replace `test.java` with a health endpoint like `/api/v1/health`.

