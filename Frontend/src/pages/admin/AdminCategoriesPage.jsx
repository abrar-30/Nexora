import { useEffect, useState } from 'react'
import { categoryService } from '../../api/categoryService'
import AdminTable from '../../components/admin/AdminTable'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const EMPTY_FORM = { categoryName: '', description: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await categoryService.getAll()
      setCategories(res.data || [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (category) => {
    setForm({
      categoryName: category.categoryName,
      description: category.description || '',
    })
    setEditingId(category.categoryId)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.categoryName.trim()) return toast.error('Category name is required')
    try {
      setSaving(true)
      if (editingId) {
        await categoryService.update(editingId, form)
        toast.success('Category updated')
      } else {
        await categoryService.create(form)
        toast.success('Category created')
      }
      setShowModal(false)
      fetchCategories()
    } catch {
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.categoryName}"?`)) return
    try {
      setDeletingId(category.categoryId)
      await categoryService.delete(category.categoryId)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'categoryId', label: 'ID' },
    { key: 'categoryName', label: 'Name' },
    { key: 'description', label: 'Description' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} total</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        {loading ? (
          <Spinner />
        ) : (
          <AdminTable
            columns={columns}
            data={categories}
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editingId ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Field
              label="Category Name *"
              value={form.categoryName}
              onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
              placeholder="e.g. Electronics"
            />
            <Field
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              textarea
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200
                  rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700
                  text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
            outline-none focus:border-indigo-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
            outline-none focus:border-indigo-500"
        />
      )}
    </div>
  )
}