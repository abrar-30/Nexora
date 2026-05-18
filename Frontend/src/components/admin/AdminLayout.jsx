import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/orders',     label: 'Orders',     icon: '🛍️' },
  { to: '/admin/payments',   label: 'Payments',   icon: '💳' },
  { to: '/admin/stock',      label: 'Stock',       icon: '🏪' },
  { to: '/admin/stock-transactions', label: 'Transactions', icon: '📋' },
  { to: '/admin/tax-slabs',   label: 'Tax Slabs',  icon: '🧾' }, 
  { to: '/admin/units',       label: 'Units',      icon: '📏' },
  { to: '/admin/countries',   label: 'Countries',  icon: '🌍' }, 
  { to: '/admin/states',      label: 'States',     icon: '🗺️' }, 
  { to: '/admin/cities',      label: 'Cities',     icon: '🏙️' }, 
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-indigo-600">🛒 Nexora</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center
              justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.firstName || user?.email}
              </p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-sm text-red-500 hover:text-red-600
              hover:bg-red-50 px-4 py-2 rounded-xl transition text-left cursor-pointer"
          >
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}