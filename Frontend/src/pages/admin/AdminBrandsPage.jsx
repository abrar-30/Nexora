import { useEffect, useState } from 'react'
import { brandService } from '../../api/brandService'
import AdminTable from '../../components/admin/AdminTable'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const EMPTY_FORM = { brandName: '', description: '' }

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchBrands() }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const res = await brandService.getAll()
      setBrands(res.data || res || [])
    } catch {
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (brand) => {
    setForm({
      brandName: brand.brandName,
      description: brand.description || '',
    })
    setEditingId(brand.brandId || brand.id)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.brandName.trim()) return toast.error('Brand name is required')
    try {
      setSaving(true)
      if (editingId) {
        await brandService.update(editingId, form)
        toast.success('Brand updated')
      } else {
        await brandService.create(form)
        toast.success('Brand created')
      }
      setShowModal(false)
      fetchBrands()
    } catch {
      toast.error('Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (brand) => {
    const id = brand.brandId || brand.id
    if (!window.confirm(`Delete "${brand.brandName}"?`)) return
    try {
      setDeletingId(id)
      await brandService.delete(id)
      toast.success('Brand deleted')
      fetchBrands()
    } catch {
      toast.error('Failed to delete brand')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'brandId', label: 'ID', render: (row) => row.brandId || row.id },
    { key: 'brandName', label: 'Name' },
    { key: 'description', label: 'Description' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Brands Management</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">{brands.length} total brands</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm hover:shadow"
        >
          + Add Brand
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <Spinner />
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={brands}
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editingId ? 'Edit Brand' : 'Add Brand'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Field
              label="Brand Name *"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              placeholder="e.g. Nike"
            />
            <Field
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              textarea
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                  rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700
                  text-white rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? 'Saving...' : editingId ? 'Update Brand' : 'Create Brand'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── Shared Modal ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 transition-all">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-xl tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Shared Field ─────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
            outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none bg-gray-50/50"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
            outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-gray-50/50"
        />
      )}
    </div>
  )
}
