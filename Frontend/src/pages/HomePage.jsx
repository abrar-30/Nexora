import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl
        px-8 py-16 text-center mb-12 border border-indigo-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isAuthenticated
            ? `Welcome back, ${user?.firstName || 'there'} 👋`
            : 'Find what you love 🛍️'}
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          Discover thousands of products at the best prices
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/products"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium
              px-6 py-3 rounded-xl transition"
          >
            Shop Now
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium
                px-6 py-3 rounded-xl border border-gray-200 transition"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'All Products', icon: '📦', to: '/products' },
          { label: 'My Cart', icon: '🛒', to: '/cart' },
          { label: 'My Orders', icon: '📋', to: '/orders' },
          { label: 'My Profile', icon: '👤', to: '/profile' },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-center
              hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}