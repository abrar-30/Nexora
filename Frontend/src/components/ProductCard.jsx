import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.productId}`}>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden
        hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">

        {/* Image */}
        <div className="h-52 bg-gray-100 overflow-hidden">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.productDisplayName}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-indigo-500 font-medium mb-1">
            {product.brandName}
          </p>

          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
            {product.productDisplayName}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {/* ✅ Final Price (with tax) */}
              <span className="text-lg font-bold text-gray-900">
                ₹{product.finalPrice?.toLocaleString()}
              </span>

              {/* ✅ MRP (with tax) */}
              {product.finalMrp > product.finalPrice && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  ₹{product.finalMrp?.toLocaleString()}
                </span>
              )}
            </div>

            {/* ✅ Discount */}
            {product.finalMrp > product.finalPrice && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {Math.round(
                  ((product.finalMrp - product.finalPrice) / product.finalMrp) * 100
                )}
                % off
              </span>
            )}
          </div>

          {/* Optional: GST label */}
          <p className="text-xs text-gray-400 mt-1">
            {product.categoryName} • Incl. GST
          </p>
        </div>
      </div>
    </Link>
  )
}