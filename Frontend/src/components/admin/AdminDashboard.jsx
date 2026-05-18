import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { stockService } from '../../api/stockService'
import { brandService } from '../../api/brandService'
import { orderService } from '../../api/orderService'
import Spinner from '../ui/Spinner'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    stock: 0,
    brands: 0,
    orders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      stockService.getAll(),
      brandService.getAll(),
      orderService.getAll()
    ]).then(([productsRes, categoriesRes, stockRes, brandsRes, ordersRes]) => {
      const orders = ordersRes?.data?.data || ordersRes?.data || ordersRes || []
      setStats({
        products: productsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        stock: stockRes.data?.length || 0,
        brands: brandsRes.data?.length || 0,
        orders: orders.length || 0,
      })
      // Slice the last 5 orders for the recent list
      setRecentOrders(orders.slice(0, 5))
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const cards = [
    { label: 'Total Orders', value: stats.orders, icon: '🛍️', to: '/admin/orders', bg: 'bg-blue-500', iconBg: 'bg-blue-400/30' },
    { label: 'Total Products', value: stats.products, icon: '📦', to: '/admin/products', bg: 'bg-indigo-500', iconBg: 'bg-indigo-400/30' },
    { label: 'Categories', value: stats.categories, icon: '🗂️', to: '/admin/categories', bg: 'bg-purple-500', iconBg: 'bg-purple-400/30' },
    { label: 'Total Brands', value: stats.brands, icon: '🏷️', to: '/admin/brands', bg: 'bg-pink-500', iconBg: 'bg-pink-400/30' },
  ]

  if (loading) {
    return <div className="py-20"><Spinner /></div>
  }

  const getStatusColor = (status) => {
    const s = String(status).toUpperCase()
    switch (s) {
      case 'DELIVERED': return 'text-green-700 bg-green-100'
      case 'CANCELLED': return 'text-red-700 bg-red-100'
      case 'SHIPPED': return 'text-blue-700 bg-blue-100'
      case 'CONFIRMED': return 'text-indigo-700 bg-indigo-100'
      case 'PROCESSING': return 'text-amber-700 bg-amber-100'
      default: return 'text-gray-700 bg-gray-100' // PENDING or others
    }
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">
            Welcome back, <span className="text-indigo-600">{user?.firstName || 'Admin'}</span> 👋
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
              font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            + New Product
          </Link>
          <Link
            to="/admin/categories"
            className="bg-white hover:bg-gray-50 text-gray-700 text-sm
              font-semibold px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all"
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`${card.bg} text-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer`}
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-4xl font-black">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${card.iconBg} backdrop-blur-sm`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Orders</h2>
            <Link to="/admin/orders" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View All &rarr;</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No recent orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-400 uppercase tracking-wide text-xs">Order ID</th>
                    <th className="pb-3 font-semibold text-gray-400 uppercase tracking-wide text-xs">Date</th>
                    <th className="pb-3 font-semibold text-gray-400 uppercase tracking-wide text-xs">Amount</th>
                    <th className="pb-3 font-semibold text-gray-400 uppercase tracking-wide text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.orderId} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">
                        <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition">
                          #{order.orderNumber || order.orderId}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-500 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-2 font-bold text-gray-900">
                        ₹{Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusColor(order.orderStatus || order.status)}`}>
                          {order.orderStatus || order.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links / Status */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">System Overview</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                🟢
              </div>
              <div>
                <p className="font-bold text-gray-900">Store Active</p>
                <p className="text-xs text-gray-500 font-medium">Accepting new orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                🏪
              </div>
              <div>
                <p className="font-bold text-gray-900">{stats.stock} Stock Items</p>
                <Link to="/admin/stock" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Manage Inventory &rarr;</Link>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                💳
              </div>
              <div>
                <p className="font-bold text-gray-900">Payment Gateway</p>
                <Link to="/admin/payments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View Logs &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}