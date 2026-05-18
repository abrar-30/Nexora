import { useEffect, useState } from 'react'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { Link } from 'react-router-dom'
import { stockService } from '../../api/stockService'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    stock: 0,
  })

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      stockService.getAll() 
    ]).then(([productsRes, categoriesRes, stockRes]) => {
      setStats({
        products: productsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        stock: stockRes.data?.length || 0,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '📦', to: '/admin/products', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Categories', value: stats.categories, icon: '🗂️', to: '/admin/categories', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Stock Items', value: stats.stock, icon: '🏪', to: '/admin/stock', color: 'bg-green-50 text-green-600' },
    
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome to your admin panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white border border-gray-200 rounded-2xl p-6
              hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              text-xl mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/admin/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
              font-medium px-5 py-2.5 rounded-xl transition"
          >
            + Add Product
          </Link>
          <Link
            to="/admin/categories/new"
            className="bg-white hover:bg-gray-50 text-gray-700 text-sm
              font-medium px-5 py-2.5 rounded-xl border border-gray-200 transition"
          >
            + Add Category
          </Link>
        </div>
      </div>
    </div>
  )
}