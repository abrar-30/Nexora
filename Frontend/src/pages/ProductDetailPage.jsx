import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../api/productService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import Spinner from "../components/ui/Spinner";
import { cartService } from "../api/cartService";
import React from "react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [variantImages, setVariantImages] = useState([]);
  const [variantImagesMap, setVariantImagesMap] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);

  // Cart state from context
  const { cart, updateCart } = useCart();
  const cartItems = cart?.cartItems || [];
  const [cartUpdating, setCartUpdating] = useState(false);

  // const [alert, setAlert] = useState(null);

  // ✅ Tax helper
  const addTax = (price) => {
    if (!price || isNaN(price)) return 0;
    const taxRate = product?.taxPercentage ? product.taxPercentage / 100 : 0.12; // default 12%
    return Math.round(price + price * taxRate);
  };

  // 🧩 Fetch product
  useEffect(() => {
    productService
      .getById(id)
      .then((res) => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  // 🧩 Fetch variants
  useEffect(() => {
    if (id) {
      productService
        .getVariantsByProductId(id)
        .then((res) => {
          const data = res.data?.data || [];
          setVariants(data);

          if (data.length > 0) {
            setSelectedVariant(data[0]);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [id]);

  // 🧩 Load selected variant images (instant if cached)
  useEffect(() => {
    if (!selectedVariant?.variantId) return;

    const variantId = selectedVariant.variantId;

    // ✅ Use cache
    if (variantImagesMap[variantId]) {
      const images = variantImagesMap[variantId];

      setVariantImages(images);

      const primary = images.find((img) => img.isPrimary) || images[0];

      setSelectedImage(primary?.imageUrl || product?.mainImageUrl);
      return;
    }

    // ❌ Fetch if not cached
    productService
      .getVariantImages(variantId)
      .then((res) => {
        const images = res.data || [];

        setVariantImagesMap((prev) => ({
          ...prev,
          [variantId]: images,
        }));

        setVariantImages(images);

        if (images.length > 0) {
          const primary = images.find((img) => img.isPrimary) || images[0];

          setSelectedImage(primary.imageUrl);
        } else {
          setSelectedImage(product?.mainImageUrl);
        }
      })
      .catch(() => {
        setSelectedImage(product?.mainImageUrl);
      });
  }, [selectedVariant, product, variantImagesMap]);

  // useEffect(() => {
  //   if (alert) {
  //     const timer = setTimeout(() => setAlert(null), 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [alert]);

  // 🛒 Add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      localStorage.setItem("redirectAfterLogin", `/product/${id}`);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }
    try {
      setCartUpdating(true);
      const res = await cartService.manageItem(selectedVariant?.variantId, 1);
      updateCart(res.data);
      toast.success("Item added to cart 🛒");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item to cart");
    } finally {
      setCartUpdating(false);
    }
  };

  // 🔄 Update quantity
  const handleUpdateQuantity = async (newQty) => {
    if (!isAuthenticated) return;
    try {
      setCartUpdating(true);
      const res = await cartService.manageItem(selectedVariant?.variantId, newQty);
      updateCart(res.data);
      if (newQty === 0) toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update cart");
    } finally {
      setCartUpdating(false);
    }
  };

  // ⚡ Buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed to checkout");
      localStorage.setItem("redirectAfterLogin", `/product/${id}`);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    navigate(
      `/checkout/${product.productId}?variantId=${selectedVariant?.variantId || ""}`,
    );
  };

  if (loading) return <Spinner />;

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  // 🔥 Final price calculation
  const basePrice =
    selectedVariant?.variantPrice ??
    product.basePrice ??
    product.unitPrice ??
    0;

  const mrp = selectedVariant?.mrp ?? product.mrp ?? basePrice;

  const finalPrice = addTax(basePrice);
  const finalMrp = addTax(mrp);

  const currentCartItem = cartItems.find(
    (item) => item.productVariantId === selectedVariant?.variantId
  );

  // 🧪 Debug
  // console.log({ basePrice, mrp, finalPrice, finalMrp });

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* {alert && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 text-white ${
            alert.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {alert.text}
        </div>
      )} */}
      {/* LEFT: IMAGE */}
      <div>
        <img
          src={selectedImage || product.mainImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="rounded-xl w-full h-[450px] object-contain bg-gray-50 p-4 transition-all duration-300"
        />

        {/* 🖼️ Thumbnails */}
        {variantImages.length > 0 && (
          <div className="flex gap-2 mt-4">
            {variantImages.map((img) => (
              <img
                key={img.imageId}
                src={img.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onClick={() => setSelectedImage(img.imageUrl)}
                className={`w-16 h-16 object-contain bg-white p-1 rounded-lg cursor-pointer border transition
                  ${
                    selectedImage === img.imageUrl
                      ? "border-indigo-600 scale-105"
                      : "border-gray-300 hover:border-indigo-400"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: DETAILS */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {product.productDisplayName || product.productName}
        </h1>

        <p className="text-gray-500 mb-2">
          {product.brandName} • {product.categoryName}
        </p>

        {product.itemCode && (
          <p className="text-xs text-gray-400 mb-4">SKU: {product.itemCode}</p>
        )}

        {/* 💰 Price WITH TAX */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-indigo-600">
            ₹{finalPrice.toLocaleString()}
          </p>

          {finalMrp > finalPrice && (
            <p className="text-gray-400 line-through">
              ₹{finalMrp.toLocaleString()}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-1">Incl. GST</p>
        </div>

        {/* 🎨 Variants */}
        {variants.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Select Variant</h2>

            <div className="flex flex-wrap gap-3">
              {variants.map((variant) => {
                const isSelected =
                  selectedVariant?.variantId === variant.variantId;

                return (
                  <React.Fragment key={variant.variantId}>
                    <div
                      onClick={() => setSelectedVariant(variant)}
                      className={`cursor-pointer px-4 py-2 rounded-lg border text-sm transition
                ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400"
                }
              `}
                    >
                      <p className="font-medium">{variant.variantName}</p>
                      <p className="text-xs text-gray-500">
                        ₹{addTax(variant.variantPrice).toLocaleString()}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Unit + Tax */}
        <div className="text-sm text-gray-600 mb-6 space-y-1">
          {product.unitName && <p>Unit: {product.unitName}</p>}
          {product.taxName && (
            <p>
              Tax: {product.taxName} ({product.taxPercentage}%)
            </p>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-6">
            <h2 className="font-semibold mb-1">Description</h2>
            <p className="text-gray-600 text-sm">{product.description}</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          {currentCartItem ? (
            <div className="flex items-center border-2 border-indigo-600 rounded-lg overflow-hidden bg-white h-[48px]">
              <button
                onClick={() => handleUpdateQuantity(currentCartItem.quantity - 1)}
                disabled={cartUpdating}
                className="w-12 h-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition cursor-pointer text-xl"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-bold text-gray-800">
                {cartUpdating ? "..." : currentCartItem.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(currentCartItem.quantity + 1)}
                disabled={cartUpdating}
                className="w-12 h-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition cursor-pointer text-xl"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={cartUpdating}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer h-[48px] flex items-center justify-center font-medium"
            >
              {cartUpdating ? "Adding..." : "Add to Cart"}
            </button>
          )}

          <button
            onClick={handleBuyNow}
            className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer h-[48px] flex items-center justify-center font-medium text-gray-700"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
