import { useEffect, useState } from 'react'
import { locationService } from '../../../api/locationService'
import Spinner from '../../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([])
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCity, setEditingCity] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [filterState, setFilterState] = useState('')

  useEffect(() => {
    Promise.all([
      locationService.getCities(),
      locationService.getCountries(),
      locationService.getStates(),
    ]).then(([citiesRes, countriesRes, statesRes]) => {
      setCities(citiesRes.data || [])
      setCountries(countriesRes.data || [])
      setStates(statesRes.data || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const fetchCities = async () => {
    const res = await locationService.getCities()
    setCities(res.data || [])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this city?')) return
    try {
      setDeletingId(id)
      await locationService.deleteCity(id)
      toast.success('City deleted')
      fetchCities()
    } catch {
      toast.error('Failed to delete city')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = filterState
    ? cities.filter(c => String(c.stateId) === filterState)
    : cities

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cities</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} total</p>
        </div>
        <button
          onClick={() => { setEditingCity(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add City
        </button>
      </div>

      {/* Filter by state */}
      <div className="mb-5">
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm
            outline-none focus:border-indigo-500 bg-white min-w-48"
        >
          <option value="">All States</option>
          {states.map(s => (
            <option key={s.stateId} value={String(s.stateId)}>
              {s.stateName}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏙️</p>
            <p className="text-sm">No cities found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'City Name', 'State', 'Country', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                    text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((city) => (
                <tr key={city.cityId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{city.cityId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{city.cityName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-50 text-purple-600
                      px-2.5 py-1 rounded-full font-medium">
                      {city.stateName || `State #${city.stateId}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-600
                      px-2.5 py-1 rounded-full font-medium">
                      {city.countryName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingCity(city); setShowModal(true) }}
                        className="text-xs text-indigo-600 border border-indigo-200
                          hover:border-indigo-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(city.cityId)}
                        disabled={deletingId === city.cityId}
                        className="text-xs text-red-500 border border-red-200
                          hover:border-red-400 px-3 py-1.5 rounded-lg transition
                          disabled:opacity-40 cursor-pointer"
                      >
                        {deletingId === city.cityId ? '...' : 'Delete'}
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
        <CityModal
          editingCity={editingCity}
          countries={countries}
          states={states}
          onClose={() => { setShowModal(false); setEditingCity(null) }}
          onSaved={() => { setShowModal(false); setEditingCity(null); fetchCities() }}
        />
      )}
    </div>
  )
}

function CityModal({ editingCity, countries, states, onClose, onSaved }) {
  const [form, setForm] = useState({
    cityName:  editingCity?.cityName  || '',
    countryId: editingCity?.stateId
      ? String(states.find(s => s.stateId === editingCity.stateId)?.countryId || '')
      : '',
    stateId:   editingCity?.stateId   ? String(editingCity.stateId) : '',
  })
  const [saving, setSaving] = useState(false)

  // filtered states based on selected country
  const filteredStates = form.countryId
    ? states.filter(s => String(s.countryId) === form.countryId)
    : states

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'countryId') {
      setForm(prev => ({ ...prev, countryId: value, stateId: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cityName.trim()) return toast.error('City name is required')
    if (!form.stateId) return toast.error('State is required')

    const payload = {
      cityName: form.cityName,
      stateId:  Number(form.stateId),
    }

    try {
      setSaving(true)
      if (editingCity?.cityId) {
        await locationService.updateCity(editingCity.cityId, payload)
        toast.success('City updated')
      } else {
        await locationService.createCity(payload)
        toast.success('City created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save city')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingCity ? 'Edit City' : 'Add City'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              name="countryId"
              value={form.countryId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Select country (optional filter)</option>
              {countries.map(c => (
                <option key={c.countryId} value={String(c.countryId)}>{c.countryName}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="stateId"
              value={form.stateId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Select state</option>
              {filteredStates.map(s => (
                <option key={s.stateId} value={String(s.stateId)}>{s.stateName}</option>
              ))}
            </select>
          </div>

          {/* City Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name *</label>
            <input
              type="text"
              name="cityName"
              value={form.cityName}
              onChange={handleChange}
              placeholder="e.g. Ahmedabad"
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
              {saving ? 'Saving...' : editingCity ? 'Update' : 'Create'}
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