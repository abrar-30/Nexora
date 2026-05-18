import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { unitService } from '../../../api/unitService'
import Spinner from '../../../components/ui/Spinner'

export default function AdminUnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchUnits() }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const res = await unitService.getAll()
      setUnits(res.data || [])
    } catch {
      toast.error('Failed to load units')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (unit) => {
    setEditingUnit(unit)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unit?')) return
    try {
      setDeletingId(id)
      await unitService.delete(id)
      toast.success('Unit deleted')
      fetchUnits()
    } catch {
      toast.error('Failed to delete unit')
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingUnit(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units</h1>
          <p className="text-gray-400 text-sm mt-1">{units.length} total</p>
        </div>
        <button
          onClick={() => { setEditingUnit(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add Unit
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : units.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📏</p>
            <p className="text-sm">No units found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Unit Name', 'Short Name', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                      text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {units.map((unit) => (
                  <tr key={unit.unitId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      #{unit.unitId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {unit.unitName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs
                        font-medium px-2.5 py-1 rounded-full">
                        {unit.shortName || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${unit.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-500'}`}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-xs text-indigo-600 border border-indigo-200
                            hover:border-indigo-400 px-3 py-1.5 rounded-lg
                            transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(unit.unitId)}
                          disabled={deletingId === unit.unitId}
                          className="text-xs text-red-500 border border-red-200
                            hover:border-red-400 px-3 py-1.5 rounded-lg transition
                            disabled:opacity-40 cursor-pointer"
                        >
                          {deletingId === unit.unitId ? '...' : 'Delete'}
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
        <UnitModal
          editingUnit={editingUnit}
          onClose={handleModalClose}
          onSaved={() => { handleModalClose(); fetchUnits() }}
        />
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────
function UnitModal({ editingUnit, onClose, onSaved }) {
  const [form, setForm] = useState({
    unitName:  editingUnit?.unitName  || '',
    shortName: editingUnit?.shortName || '',
    isActive:  editingUnit?.isActive  ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.unitName.trim())  return toast.error('Unit name is required')
    if (!form.shortName.trim()) return toast.error('Short name is required')

    const payload = {
      unitName:  form.unitName,
      shortName: form.shortName,
      isActive:  form.isActive,
    }

    try {
      setSaving(true)
      if (editingUnit?.unitId) {
        await unitService.update(editingUnit.unitId, payload)
        toast.success('Unit updated')
      } else {
        await unitService.create(payload)
        toast.success('Unit created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save unit')
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
            {editingUnit ? 'Edit Unit' : 'Add Unit'}
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
            label="Unit Name *"
            name="unitName"
            value={form.unitName}
            onChange={handleChange}
            placeholder="e.g. Kilogram"
          />
          <Field
            label="Short Name *"
            name="shortName"
            value={form.shortName}
            onChange={handleChange}
            placeholder="e.g. kg"
          />

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white
                font-medium py-2.5 rounded-xl transition disabled:opacity-50
                cursor-pointer"
            >
              {saving ? 'Saving...' : editingUnit ? 'Update' : 'Create'}
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