import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../api/cartService";
import { productService } from "../api/productService";
import { useCart } from "../context/CartContext";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [imagesMap, setImagesMap] = useState({}); // variantId → imageUrl

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const cartData = res.data;
      updateCart(cartData);

      // Fetch images for each cart item
      const imagePromises = cartData.cartItems.map(async (item) => {
        // console.log("Item",item);
        try {
          // 1️⃣ Try fetching variant images
          const variantImagesRes = await productService.getVariantImages(
            item.productVariantId,
          );
          const variantImages = variantImagesRes.data || [];

          let imageUrl =
            variantImages.find((img) => img.isPrimary)?.imageUrl ||
            variantImages[0]?.imageUrl;

          // 2️⃣ If variant image not found, fetch product to get main image
          if (!imageUrl) {
            const variantRes = await productService.getVariantById(
              item.productVariantId,
            );
            const productRes = await productService.getById(
              variantRes.data.data.productId,
            );
            imageUrl = productRes.data?.mainImageUrl || null;
          }

          return { variantId: item.productVariantId, imageUrl };
        } catch {
          return { variantId: item.productVariantId, imageUrl: null };
        }
      });

      const imagesArray = await Promise.all(imagePromises);
      const map = {};
      imagesArray.forEach((img) => {
        map[img.variantId] = img.imageUrl;
      });
      setImagesMap(map);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (variantId, newQty) => {
    if (newQty < 0) return;
    try {
      setUpdatingId(variantId);
      const res = await cartService.manageItem(variantId, newQty);
      updateCart(res.data);
      if (newQty === 0) toast.success("Item removed");
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await cartService.clearCart();
      updateCart(res.data);
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  if (loading) return <Spinner />;

 // Inside your CartPage component, before the return statement:
const items = [...(cart?.cartItems || [])].sort((a, b) => 
  a.productVariantId - b.productVariantId
);


  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Looks like you haven't added anything yet
        </p>
        <Link
          to="/products"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3
            rounded-xl font-medium transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }
  

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-400 text-sm mt-1">
            {cart?.totalItems} item(s)
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-sm text-red-500 hover:text-red-600 border border-red-200
            hover:border-red-400 px-4 py-2 rounded-lg transition cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.productVariantId}
              item={item}
              imageUrl={imagesMap[item.productVariantId]}
              updatingId={updatingId}
              onQuantityChange={(variantId, qty) =>
                handleQuantityChange(variantId, qty)
              }
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary cart={cart} onCheckout={() => navigate("/checkout")} />
        </div>
      </div>
    </div>
  );
}

// ─── Cart Item ────────────────────────────────────────────────
function CartItem({
  item,
  imageUrl,
  updatingId,
  onQuantityChange,
  taxPercentage = 12,
}) {
  const isUpdating = updatingId === item.productVariantId;

  const addTax = (price, taxPercentage = 12) => {
    if (!price || isNaN(price)) return 0;
    return Math.round(price + (price * taxPercentage) / 100);
  };

  const unitPriceWithTax = addTax(item.unitPrice, taxPercentage);
  const totalPriceWithTax = unitPriceWithTax * item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4">
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.productName}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm truncate">
          {item.productName}
        </h3>
        <p className="text-indigo-600 font-bold mt-1">
          ₹{unitPriceWithTax.toLocaleString()}{" "}
          <span className="text-xs text-gray-400">Incl. GST</span>
        </p>

        {/* Quantity + Remove */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {/* Decrease */}
            <button
              onClick={() => {
                const newQty = item.quantity - 1;
                if (newQty >= 1)
                  onQuantityChange(item.productVariantId, newQty);
                else onQuantityChange(item.productVariantId, 0); // optional: remove if 0
              }}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center text-gray-600
        hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
            >
              −
            </button>

            {/* Quantity Display */}
            <span className="w-8 text-center text-sm font-medium">
              {isUpdating ? "..." : item.quantity}
            </span>

            {/* Increase */}
            <button
              onClick={() =>
                onQuantityChange(item.productVariantId, item.quantity + 1)
              }
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center text-gray-600
        hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => onQuantityChange(item.productVariantId, 0)}
            disabled={isUpdating}
            className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-800">
          ₹{totalPriceWithTax.toLocaleString()}{" "}
          <span className="text-xs text-gray-400">Incl. GST</span>
        </p>
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────
function OrderSummary({ cart, onCheckout }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
      <h2 className="font-bold text-gray-900 mb-5 text-lg">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({cart?.totalItems} items)</span>
          <span>₹{cart?.subtotal?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₹{cart?.taxAmount?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <div
          className="border-t border-gray-100 pt-3 flex justify-between
          font-bold text-gray-900 text-base"
        >
          <span>Total</span>
          <span>₹{cart?.totalPrice?.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white
          font-medium py-3 rounded-xl transition cursor-pointer"
      >
        Proceed to Checkout
      </button>

      <Link
        to="/products"
        className="block text-center text-sm text-indigo-500 hover:underline mt-4"
      >
        ← Continue Shopping
      </Link>
    </div>
  );
}
