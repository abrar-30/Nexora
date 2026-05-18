import { useEffect, useState } from 'react'
import { locationService } from '../../../api/locationService'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminStatesPage() {
  const [states, setStates] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingState, setEditingState] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [filterCountry, setFilterCountry] = useState('')

  useEffect(() => {
    Promise.all([
      locationService.getStates(),
      locationService.getCountries(),
    ]).then(([statesRes, countriesRes]) => {
      setStates(statesRes.data || [])
      setCountries(countriesRes.data || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const fetchStates = async () => {
    const res = await locationService.getStates()
    setStates(res.data || [])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this state?')) return
    try {
      setDeletingId(id)
      await locationService.deleteState(id)
      toast.success('State deleted')
      fetchStates()
    } catch {
      toast.error('Failed to delete state')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = filterCountry
    ? states.filter(s => String(s.countryId) === filterCountry)
    : states

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">States</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} total</p>
        </div>
        <button
          onClick={() => { setEditingState(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add State
        </button>
      </div>

      {/* Filter by country */}
      <div className="mb-5">
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm
            outline-none focus:border-indigo-500 bg-white min-w-48"
        >
          <option value="">All Countries</option>
          {countries.map(c => (
            <option key={c.countryId} value={String(c.countryId)}>
              {c.countryName}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-sm">No states found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'State Name', 'Country', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                    text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((state) => (
                <tr key={state.stateId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{state.stateId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{state.stateName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5
                      py-1 rounded-full font-medium">
                      {state.countryName || `Country #${state.countryId}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingState(state); setShowModal(true) }}
                        className="text-xs text-indigo-600 border border-indigo-200
                          hover:border-indigo-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(state.stateId)}
                        disabled={deletingId === state.stateId}
                        className="text-xs text-red-500 border border-red-200
                          hover:border-red-400 px-3 py-1.5 rounded-lg transition
                          disabled:opacity-40 cursor-pointer"
                      >
                        {deletingId === state.stateId ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <StateModal
          editingState={editingState}
          countries={countries}
          onClose={() => { setShowModal(false); setEditingState(null) }}
          onSaved={() => { setShowModal(false); setEditingState(null); fetchStates() }}
        />
      )}
    </div>
  )
}

function StateModal({ editingState, countries, onClose, onSaved }) {
  const [form, setForm] = useState({
    stateName: editingState?.stateName || '',
    countryId: editingState?.countryId ? String(editingState.countryId) : '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.stateName.trim()) return toast.error('State name is required')
    if (!form.countryId) return toast.error('Country is required')

    const payload = {
      stateName: form.stateName,
      countryId: Number(form.countryId),
    }

    try {
      setSaving(true)
      if (editingState?.stateId) {
        await locationService.updateState(editingState.stateId, payload)
        toast.success('State updated')
      } else {
        await locationService.createState(payload)
        toast.success('State created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save state')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingState ? 'Edit State' : 'Add State'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              value={form.countryId}
              onChange={(e) => setForm({ ...form, countryId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Select country</option>
              {countries.map(c => (
                <option key={c.countryId} value={String(c.countryId)}>{c.countryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State Name *</label>
            <input
              type="text"
              value={form.stateName}
              onChange={(e) => setForm({ ...form, stateName: e.target.value })}
              placeholder="e.g. Gujarat"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white
                font-medium py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : editingState ? 'Update' : 'Create'}
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