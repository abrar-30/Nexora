import { useEffect, useState } from 'react'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { taxSlabService } from '../../../api/taxSlabService'

const EMPTY_FORM = {
  taxName: '',
  taxPercentage: '',
}

export default function AdminTaxSlabsPage() {
  const [taxSlabs, setTaxSlabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTaxSlab, setEditingTaxSlab] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchTaxSlabs() }, [])

  const fetchTaxSlabs = async () => {
    try {
      setLoading(true)
      const res = await taxSlabService.getAll()
      setTaxSlabs(res.data || [])
    } catch {
      toast.error('Failed to load tax slabs')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (taxSlab) => {
    setEditingTaxSlab(taxSlab)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tax slab?')) return
    try {
      setDeletingId(id)
      await taxSlabService.delete(id)
      console.log('Deleted tax slab with ID:', id)
      toast.success('Tax slab deleted')
      fetchTaxSlabs()
    } catch {
      toast.error('Failed to delete tax slab')
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTaxSlab(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Slabs</h1>
          <p className="text-gray-400 text-sm mt-1">{taxSlabs.length} total</p>
        </div>
        <button
          onClick={() => { setEditingTaxSlab(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add Tax Slab
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : taxSlabs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm">No tax slabs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Tax Name', 'Percentage', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                      text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {taxSlabs.map((tax) => (
                  <tr key={tax.taxSlabId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      #{tax.taxSlabId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {tax.taxName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-50 text-green-700 text-xs
                        font-semibold px-2.5 py-1 rounded-full">
                        {tax.taxPercentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(tax)}
                          className="text-xs text-indigo-600 border border-indigo-200
                            hover:border-indigo-400 px-3 py-1.5 rounded-lg
                            transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tax.taxSlabId)}
                          disabled={deletingId === tax.taxSlabId}
                          className="text-xs text-red-500 border border-red-200
                            hover:border-red-400 px-3 py-1.5 rounded-lg transition
                            disabled:opacity-40 cursor-pointer"
                        >
                          {deletingId === tax.taxSlabId ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TaxSlabModal
          editingTaxSlab={editingTaxSlab}
          onClose={handleModalClose}
          onSaved={() => { handleModalClose(); fetchTaxSlabs() }}
        />
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────
function TaxSlabModal({ editingTaxSlab, onClose, onSaved }) {
  const [form, setForm] = useState({
    taxName:       editingTaxSlab?.taxName        || '',
    taxPercentage: editingTaxSlab?.taxPercentage  ? String(editingTaxSlab.taxPercentage) : '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.taxName.trim())    return toast.error('Tax name is required')
    if (!form.taxPercentage)     return toast.error('Tax percentage is required')
    if (Number(form.taxPercentage) < 0 || Number(form.taxPercentage) > 100)
      return toast.error('Percentage must be between 0 and 100')

    const payload = {
      taxName:       form.taxName,
      taxPercentage: Number(form.taxPercentage),
    }

    try {
      setSaving(true)
      if (editingTaxSlab?.taxSlabId) {
        await taxSlabService.update(editingTaxSlab.taxSlabId, payload)
        toast.success('Tax slab updated')
      } else {
        await taxSlabService.create(payload)
        toast.success('Tax slab created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save tax slab')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center
      justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingTaxSlab ? 'Edit Tax Slab' : 'Add Tax Slab'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Tax Name *"
            name="taxName"
            value={form.taxName}
            onChange={handleChange}
            placeholder="e.g. GST 18%"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Percentage *
            </label>
            <div className="relative">
              <input
                type="number"
                name="taxPercentage"
                value={form.taxPercentage}
                onChange={handleChange}
                placeholder="e.g. 18"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
                  text-sm outline-none focus:border-indigo-500 pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2
                text-gray-400 text-sm font-medium">
                %
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white
                font-medium py-2.5 rounded-xl transition disabled:opacity-50
                cursor-pointer"
            >
              {saving ? 'Saving...' : editingTaxSlab ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-500 border border-gray-200
                rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
          outline-none focus:border-indigo-500"
      />
    </div>
  )
}