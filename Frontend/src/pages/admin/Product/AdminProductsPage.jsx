import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productService } from '../../../api/productService'
import AdminTable from '../../../components/admin/AdminTable'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  
  // Custom Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const navigate = useNavigate()

  useEffect(() => { 
    fetchProducts() 
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await productService.getAll()
      setProducts(res.data || [])
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // --- 1. Dedicated Toggle Status Logic ---
  const handleToggleStatus = async (e, product) => {
    e.stopPropagation(); // Prevent row click events if any
    try {
      const newStatus = !product.isActive;
      
      // Using the dedicated endpoint we discussed
      await productService.toggleStatus(product.productId, newStatus);
      
      toast.success(`Product ${newStatus ? 'Activated' : 'Deactivated'}`);
      fetchProducts(); // Refresh the list from server
    } catch (err) {
      console.error("Status Update Error:", err);
      toast.error('Failed to update status');
    }
  }

  // --- 2. Custom Delete Logic ---
  const triggerDeleteConfirm = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }

  const handleViewDetail = (product) => {
    navigate(`/admin/products/${product.productId}`);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeletingId(productToDelete.productId);
      await productService.delete(productToDelete.productId);
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  }

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.productId}`);
  }

  // --- 3. Enhanced Filter Logic ---
  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.productDisplayName?.toLowerCase().includes(term) ||
      p.brandName?.toLowerCase().includes(term) ||
      p.categoryName?.toLowerCase().includes(term) ||
      p.taxSlabName?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
          {row.mainImageUrl ? (
            <img src={row.mainImageUrl} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl bg-gray-100">📦</div>
          )}
        </div>
      ),
    },
    { 
      key: 'productDisplayName', 
      label: 'Product Details',
      render: (row) => (
        <div 
          className="flex flex-col cursor-pointer group" 
          onClick={() => handleViewDetail(row)}
        >
          <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
            {row.productDisplayName}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">ID: #{row.productId} (Click to manage)</span>
        </div>
      )
    },
    { 
      key: 'brandName', 
      label: 'Brand',
      render: (row) => <span className="text-gray-600 font-medium text-sm">{row.brandName || 'N/A'}</span>
    },
    { 
      key: 'categoryName', 
      label: 'Category',
      render: (row) => (
        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-indigo-100">
          {row.categoryName || 'General'}
        </span>
      )
    },
    { 
      key: 'unitName', 
      label: 'Unit',
      render: (row) => <span className="text-gray-500 text-sm">{row.unitName || '-'}</span>
    },
    { 
      key: 'taxSlabName', 
      label: 'Tax',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-700 font-medium text-sm">{row.taxSlabName || '0%'}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">GST</span>
        </div>
      )
    },
    {
      key: 'basePrice',
      label: 'Price',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">₹{row.basePrice?.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 italic">Excl. Tax</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <button
          onClick={(e) => handleToggleStatus(e, row)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border
            ${row.isActive 
              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white' 
              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-500 hover:text-white'}`}
        >
          {row.isActive ? '● Active' : '○ Inactive'}
        </button>
      ),
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory, pricing, and visibility.</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-200">
          <span className="mr-2 text-lg">+</span> Add New Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
          🔍
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name, Brand, Category, or Tax..."
          className="w-full max-w-xl pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <Spinner />
            <p className="text-gray-400 text-sm animate-pulse">Fetching latest products...</p>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filtered}
            onEdit={handleEdit}
            onDelete={triggerDeleteConfirm}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* --- CUSTOM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-gray-100 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              🗑️
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center">Confirm Deletion</h3>
            <p className="text-gray-500 text-sm mt-3 text-center leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{productToDelete?.productDisplayName}"</span>? 
              This will remove it from the active catalog.
            </p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 font-bold transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition shadow-lg shadow-red-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}