import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { productService } from '../../api/productService'
import AdminTable from './AdminTable'
import Spinner from '../ui/Spinner'
import StockManagementDrawer from './StockManagementDrawer'
import VariantImageManager from './VariantImageManager' // New Component

export default function ProductVariantSection({ productId }) {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  
  // Modals/Drawers State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)
  const [selectedVariantForStock, setSelectedVariantForStock] = useState(null)
  const [selectedVariantForImages, setSelectedVariantForImages] = useState(null) // Added state

  useEffect(() => {
    if (productId) fetchVariants()
  }, [productId])

  const fetchVariants = async () => {
    try {
      setLoading(true)
      const res = await productService.getVariantsByProductId(productId)
      // res.data.data because of your ApiResponse wrapper
      setVariants(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load variants')
    } finally {
      setLoading(false)
    }
  }

  const triggerDeleteConfirm = (variant) => {
    setVariantToDelete(variant);
    setShowDeleteModal(true);
  }

  const executeDelete = async () => {
    try {
      setDeletingId(variantToDelete.variantId);
      await productService.deleteVariant(variantToDelete.variantId);
      toast.success('Variant removed');
      setShowDeleteModal(false);
      fetchVariants();
    } catch (err) {
      toast.error('Failed to delete variant');
    } finally {
      setDeletingId(null);
      setVariantToDelete(null);
    }
  }

  const filtered = variants.filter((v) => 
    v.variantName?.toLowerCase().includes(search.toLowerCase()) ||
    v.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'variantName',
      label: 'Variant Details',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.variantName}</span>
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">SKU: {row.sku}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Pricing (INR)',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-indigo-600">₹{row.salePrice?.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 line-through">MRP: ₹{row.mrp?.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Inventory',
      render: (row) => (
        <div 
          className="flex flex-col cursor-pointer group bg-gray-50 p-2 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
          onClick={() => setSelectedVariantForStock(row)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-black ${row.stockQuantity < 10 ? 'text-orange-600' : 'text-gray-800'}`}>
              {row.stockQuantity} Units
            </span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">⚙️</span>
          </div>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Update Stock</span>
        </div>
      )
    },
    {
      key: 'images',
      label: 'Media',
      render: (row) => (
        <button 
          onClick={() => setSelectedVariantForImages(row)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          🖼️ Photos
        </button>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
          row.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-200'
        }`}>
          {row.isActive ? 'Active' : 'Hidden'}
        </span>
      )
    }
  ]

  return (
    <div className="mt-12 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden mb-20">
      {/* Section Header */}
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Product Variants</h2>
          <p className="text-sm text-gray-500 font-medium">Manage sizes, colors, and media assets.</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          + Add New Variant
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-6 bg-gray-50/30 border-b border-gray-50">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto p-4">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-4 uppercase font-bold animate-pulse">Syncing Variants...</p>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filtered}
            onEdit={(v) => console.log("Edit Variant", v)}
            onDelete={triggerDeleteConfirm}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* 1. STOCK MANAGEMENT DRAWER */}
      {selectedVariantForStock && (
        <StockManagementDrawer 
          variant={selectedVariantForStock} 
          onClose={() => {
            setSelectedVariantForStock(null);
            fetchVariants(); 
          }} 
        />
      )}

      {/* 2. IMAGE GALLERY MANAGER */}
      {selectedVariantForImages && (
        <VariantImageManager
          variant={selectedVariantForImages}
          onClose={() => setSelectedVariantForImages(null)}
        />
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl border border-gray-100 animate-in zoom-in duration-200">
            <div className="text-red-500 mb-6 bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto">🗑️</div>
            <h3 className="text-2xl font-black text-gray-900 text-center">Delete Variant?</h3>
            <p className="text-gray-500 text-sm mt-4 text-center leading-relaxed font-medium">
              Are you sure you want to remove <span className="font-bold text-gray-800">"{variantToDelete?.variantName}"</span>? This will also affect stock history and images.
            </p>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-600 font-black transition text-[10px] uppercase">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black transition shadow-lg text-[10px] uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}