import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { categoryService } from '../api/categoryService'
import { brandService } from '../api/brandService'
import { productService } from '../api/productService'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/ui/Spinner'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const TAX_RATE = 0.12 // 12%
  const addTax = (price) => price ? price + price * TAX_RATE : 0
  const applyTaxToProducts = (products) => {
    return products.map((p) => ({
      ...p,
      finalPrice: addTax(p.basePrice),
      finalMrp: addTax(p.mrp),
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [catRes, brandRes, prodRes] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll(),
          productService.getAllActive()
        ])
        setCategories(catRes.data || [])
        setBrands(brandRes.data || [])
        // Get up to 8 products for featured
        setFeaturedProducts(applyTaxToProducts(prodRes.data || []).slice(0, 8))
      } catch (err) {
        console.error('Failed to load home page data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="py-20"><Spinner /></div>
  }

  return (
    <div className="animate-fade-in space-y-16 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl
        px-8 py-20 text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
            {isAuthenticated
              ? `Welcome back, ${user?.firstName || 'there'} 👋`
              : 'Find what you love 🛍️'}
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Discover thousands of premium products from top brands at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white hover:bg-gray-50 text-indigo-700 font-bold
                px-8 py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Shop All Products
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur-sm text-white font-bold
                  px-8 py-4 rounded-xl border border-indigo-400/50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
            <Link to="/products" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">View All &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => {
              // Smart mapping based on category name
              const getCategoryImageUrl = (name) => {
                const lower = name.toLowerCase();
                if (lower.includes('electronic') || lower.includes('tech') || lower.includes('mobile')) return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80";
                if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('apparel') || lower.includes('men') || lower.includes('women')) return "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80";
                if (lower.includes('shoe') || lower.includes('footwear')) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";
                if (lower.includes('home') || lower.includes('furniture') || lower.includes('kitchen')) return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80";
                if (lower.includes('beaut') || lower.includes('cosmetic') || lower.includes('makeup')) return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80";
                if (lower.includes('sport') || lower.includes('fitness') || lower.includes('gym')) return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80";
                if (lower.includes('headphone') || lower.includes('audio') || lower.includes('music')) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
                if (lower.includes('game') || lower.includes('gaming') || lower.includes('toy')) return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80";
                if (lower.includes('book') || lower.includes('stationery')) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80";
                if (lower.includes('grocery') || lower.includes('food')) return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
                return `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80`;
              }
              const bgImg = getCategoryImageUrl(cat.categoryName)

              return (
                <button
                  key={cat.categoryId}
                  onClick={() => navigate(`/products?category=${cat.categoryId}`)}
                  className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img src={bgImg} alt={cat.categoryName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-5 text-left">
                    <h3 className="font-bold text-xl text-white drop-shadow-md">{cat.categoryName}</h3>
                    <p className="text-sm text-gray-200 mt-1 line-clamp-1 drop-shadow-sm">{cat.description || 'Explore products'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Top Brands</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.slice(0, 12).map((brand) => {
              const getBrandLogoUrl = (name) => {
                const map = {
                  'nike': 'https://cdn.simpleicons.org/nike',
                  'adidas': 'https://cdn.simpleicons.org/adidas',
                  'apple': 'https://cdn.simpleicons.org/apple',
                  'samsung': 'https://cdn.simpleicons.org/samsung',
                  'sony': 'https://cdn.simpleicons.org/sony',
                  'puma': 'https://cdn.simpleicons.org/puma',
                  'zara': 'https://cdn.simpleicons.org/zara',
                  'h&m': 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
                  'xiaomi': 'https://cdn.simpleicons.org/xiaomi',
                  'mi': 'https://cdn.simpleicons.org/xiaomi',
                  'oneplus': 'https://cdn.simpleicons.org/oneplus',
                  'oppo': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg',
                  'vivo': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.svg',
                  'realme': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.svg',
                  'boat': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Boat_Logo.webp',
                  'dell': 'https://cdn.simpleicons.org/dell',
                  'hp': 'https://cdn.simpleicons.org/hp',
                  'asus': 'https://cdn.simpleicons.org/asus',
                  'lenovo': 'https://cdn.simpleicons.org/lenovo',
                  'lg': 'https://cdn.simpleicons.org/lg',
                  'motorola': 'https://cdn.simpleicons.org/motorola',
                  'nokia': 'https://cdn.simpleicons.org/nokia',
                  'nothing': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Nothing_Logo.svg',
                  'noise': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Noise_logo.png'
                }
                const clean = name.toLowerCase().trim()
                if (map[clean]) return map[clean]
                
                // Fallback to Clearbit
                const domain = `${clean.replace(/[^a-z0-9]/g, '')}.com`
                return `https://logo.clearbit.com/${domain}`
              }
              const logoUrl = getBrandLogoUrl(brand.brandName)

              return (
                <button
                  key={brand.brandId || brand.id}
                  onClick={() => navigate(`/products?brand=${brand.brandId || brand.id}`)}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer
                    hover:shadow-lg hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img 
                    src={logoUrl} 
                    alt={brand.brandName}
                    className="w-16 h-16 object-contain mb-3 grayscale hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName)}&background=f4f4f5&color=4f46e5&size=128&bold=true&rounded=true`
                    }}
                  />
                  <h3 className="font-bold text-sm text-gray-800 text-center tracking-wide">{brand.brandName}</h3>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
            <Link to="/products" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">View All &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}