import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../api/productService'
import { categoryService } from '../api/categoryService'
import { brandService } from '../api/brandService'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/ui/Spinner'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || ''
  const brandParam = searchParams.get('brand') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedBrand, setSelectedBrand] = useState(brandParam)
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
    // Load categories and brands just once
    const loadDropdowns = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll()
        ])
        setCategories(catRes.data || [])
        setBrands(brandRes.data || [])
      } catch (err) {
        console.error("Failed to load categories or brands")
      }
    }
    loadDropdowns()
  }, [])

  useEffect(() => {
    fetchProducts(selectedCategory, selectedBrand)
    // Synchronize URL
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedBrand) params.set('brand', selectedBrand)
    setSearchParams(params)
  }, [selectedCategory, selectedBrand, setSearchParams])

  // Sync state if URL changes externally (e.g., back button)
  useEffect(() => {
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam)
    if (brandParam !== selectedBrand) setSelectedBrand(brandParam)
  }, [categoryParam, brandParam])

  const fetchProducts = async (catId, brandId) => {
    try {
      setLoading(true)
      setError(null)
      
      let res;
      if (catId) {
        res = await productService.getByCategory(catId)
      } else if (brandId) {
        res = await productService.getByBrand(brandId)
      } else {
        res = await productService.getAllActive()
      }
      
      // Additional local filtering if both cat and brand are selected, because API might only support one at a time via those endpoints.
      let fetchedProducts = res.data || []
      
      if (catId && brandId) {
        // If we fetched by category, we need to manually filter by brand (or vice versa)
        fetchedProducts = fetchedProducts.filter(p => String(p.brandId) === String(brandId) || String(p.brand?.brandId) === String(brandId))
      } else if (!catId && !brandId && selectedBrand) {
        fetchedProducts = fetchedProducts.filter(p => String(p.brandId) === String(selectedBrand) || String(p.brand?.brandId) === String(selectedBrand))
      }

      setProducts(applyTaxToProducts(fetchedProducts))
    } catch (err) {
      setError('Failed to load products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const keyword = e.target.value
    setSearch(keyword)

    if (keyword.trim().length < 2) {
      fetchProducts(selectedCategory, selectedBrand)
      return
    }

    try {
      const res = await productService.search(keyword)
      let searchedProducts = res.data || []
      
      // Apply current filters to search results
      if (selectedCategory) {
        searchedProducts = searchedProducts.filter(p => String(p.categoryId) === String(selectedCategory))
      }
      if (selectedBrand) {
        searchedProducts = searchedProducts.filter(p => String(p.brandId) === String(selectedBrand) || String(p.brand?.brandId) === String(selectedBrand))
      }

      setProducts(applyTaxToProducts(searchedProducts))
    } catch {
      setError('Search failed.')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shop</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            {products.length} products found
          </p>
        </div>
        
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full sm:w-64 px-4 py-3 rounded-xl border border-gray-200
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-gray-50/50 transition-all"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-gray-50/50 transition-all min-w-40 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-gray-50/50 transition-all min-w-40 cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.brandId || brand.id} value={brand.brandId || brand.id}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3
          rounded-xl text-sm mb-6 font-medium shadow-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center bg-white py-24 border border-gray-100 rounded-3xl shadow-sm">
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <p className="text-xl font-bold text-gray-900 mb-2">No products found</p>
          <p className="text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {(selectedCategory || selectedBrand || search) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedBrand('');
                setSearch('');
              }}
              className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-xl transition cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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