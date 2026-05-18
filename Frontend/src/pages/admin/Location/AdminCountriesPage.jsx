import { useEffect, useState } from 'react'
import { locationService } from '../../../api/locationService'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchCountries() }, [])

  const fetchCountries = async () => {
    try {
      setLoading(true)
      const res = await locationService.getCountries()
      setCountries(res.data || [])
    } catch {
      toast.error('Failed to load countries')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this country?')) return
    try {
      setDeletingId(id)
      await locationService.deleteCountry(id)
      toast.success('Country deleted')
      fetchCountries()
    } catch {
      toast.error('Failed to delete country')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-400 text-sm mt-1">{countries.length} total</p>
        </div>
        <button
          onClick={() => { setEditingCountry(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add Country
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <Spinner /> : countries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🌍</p>
            <p className="text-sm">No countries found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'Country Name', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                    text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {countries.map((country) => (
                <tr key={country.countryId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{country.countryId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    🌍 {country.countryName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingCountry(country); setShowModal(true) }}
                        className="text-xs text-indigo-600 border border-indigo-200
                          hover:border-indigo-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(country.countryId)}
                        disabled={deletingId === country.countryId}
                        className="text-xs text-red-500 border border-red-200
                          hover:border-red-400 px-3 py-1.5 rounded-lg transition
                          disabled:opacity-40 cursor-pointer"
                      >
                        {deletingId === country.countryId ? '...' : 'Delete'}
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
        <CountryModal
          editingCountry={editingCountry}
          onClose={() => { setShowModal(false); setEditingCountry(null) }}
          onSaved={() => { setShowModal(false); setEditingCountry(null); fetchCountries() }}
        />
      )}
    </div>
  )
}

function CountryModal({ editingCountry, onClose, onSaved }) {
  const [countryName, setCountryName] = useState(editingCountry?.countryName || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!countryName.trim()) return toast.error('Country name is required')
    try {
      setSaving(true)
      if (editingCountry?.countryId) {
        await locationService.updateCountry(editingCountry.countryId, { countryName })
        toast.success('Country updated')
      } else {
        await locationService.createCountry({ countryName })
        toast.success('Country created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save country')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingCountry ? 'Edit Country' : 'Add Country'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country Name *</label>
            <input
              type="text"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="e.g. India"
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
              {saving ? 'Saving...' : editingCountry ? 'Update' : 'Create'}
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