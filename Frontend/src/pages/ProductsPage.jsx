import { useState, useEffect } from 'react'
import { productService } from '../api/productService'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/ui/Spinner'
import { categoryService } from '../api/categoryService'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [error, setError] = useState(null)

  const TAX_RATE = 0.12 // 12%

  const addTax = (price) => {
    if (!price) return 0
    return price + price * TAX_RATE
  }

  const applyTaxToProducts = (products) => {
    return products.map((p) => ({
      ...p,
      finalPrice: addTax(p.basePrice),
      finalMrp: addTax(p.mrp),
    }))
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAllActive(),
        categoryService.getAll(),
      ])

      setProducts(applyTaxToProducts(productsRes.data || []))
      setCategories(categoriesRes.data || [])
    } catch (err) {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const keyword = e.target.value
    setSearch(keyword)

    if (keyword.trim().length < 2) {
      fetchInitialData()
      return
    }

    try {
      const res = await productService.search(keyword)
      setProducts(applyTaxToProducts(res.data || []))
    } catch {
      setError('Search failed.')
    }
  }

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId)
    setSearch('')
    setError(null)

    try {
      setLoading(true)

      if (!categoryId) {
        const res = await productService.getAll()
        setProducts(applyTaxToProducts(res.data || []))
      } else {
        const res = await productService.getByCategory(categoryId)
        setProducts(applyTaxToProducts(res.data || []))
      }
    } catch {
      setError('Failed to filter products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          {products.length} products found
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search products..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300
          focus:border-indigo-500 outline-none text-sm"
        />

        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300
          focus:border-indigo-500 outline-none text-sm bg-white min-w-40"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3
          rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Products */}
      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">
            Try a different search or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  )
}