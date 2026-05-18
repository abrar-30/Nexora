import { useEffect, useState } from 'react'
import { stockService } from '../../api/stockService'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  variantId: '',
  quantity: '',
  expiryDate: '',
  batchNumber: '',
}

export default function AdminStockPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchStocks() }, [])

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const res = await stockService.getAll()
      setStocks(res.data || [])
    } catch {
      toast.error('Failed to load stocks')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (stock) => {
    setEditingStock(stock)
    setShowModal(true)
  }

  const handleDelete = async (stockId) => {
    if (!window.confirm('Delete this stock entry?')) return
    try {
      setDeletingId(stockId)
      await stockService.delete(stockId)
      toast.success('Stock deleted')
      fetchStocks()
    } catch {
      toast.error('Failed to delete stock')
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingStock(null)
  }

  const handleSaved = () => {
    handleModalClose()
    fetchStocks()
  }

  const filtered = stocks.filter(s =>
    s.variantName?.toLowerCase().includes(search.toLowerCase()) ||
    s.batchNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Master</h1>
          <p className="text-gray-400 text-sm mt-1">{stocks.length} entries</p>
        </div>
        <button
          onClick={() => { setEditingStock(null); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          + Add Stock
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by variant or batch..."
          className="w-full max-w-sm px-4 py-2.5 border border-gray-300
            rounded-xl text-sm outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No stock entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Stock ID', 'Variant', 'Batch No.', 'Quantity', 'Expiry Date', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                      text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((stock) => (
                  <tr key={stock.stockId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{stock.stockId}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {stock.variantName || '—'}
                      </span>
                      <p className="text-xs text-gray-400">ID: {stock.variantId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {stock.batchNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold
                        ${stock.quantity <= 0
                          ? 'text-red-500'
                          : stock.quantity <= 10
                          ? 'text-amber-500'
                          : 'text-green-600'
                        }`}>
                        {stock.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {stock.expiryDate
                        ? new Date(stock.expiryDate).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {stock.createdAt
                        ? new Date(stock.createdAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-xs text-indigo-600 border border-indigo-200
                            hover:border-indigo-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(stock.stockId)}
                          disabled={deletingId === stock.stockId}
                          className="text-xs text-red-500 border border-red-200
                            hover:border-red-400 px-3 py-1.5 rounded-lg transition
                            disabled:opacity-40 cursor-pointer"
                        >
                          {deletingId === stock.stockId ? '...' : 'Delete'}
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
        <StockModal
          editingStock={editingStock}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

// ─── Stock Modal ──────────────────────────────────────────────
function StockModal({ editingStock, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    variantId:   editingStock?.variantId   ? String(editingStock.variantId) : '',
    quantity:    editingStock?.quantity    ? String(editingStock.quantity)  : '',
    expiryDate:  editingStock?.expiryDate  || '',
    batchNumber: editingStock?.batchNumber || '',
  }))
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.variantId) return toast.error('Variant ID is required')
    if (!form.quantity)  return toast.error('Quantity is required')

    const payload = {
      variantId:   Number(form.variantId),
      quantity:    Number(form.quantity),
      expiryDate:  form.expiryDate  || null,
      batchNumber: form.batchNumber || null,
    }

    try {
      setSaving(true)
      if (editingStock?.stockId) {
        await stockService.update(editingStock.stockId, {
          ...payload,
          stockId: editingStock.stockId,
        })
        toast.success('Stock updated')
      } else {
        await stockService.create(payload)
        toast.success('Stock created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingStock ? 'Edit Stock' : 'Add Stock'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Variant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variant ID *
            </label>
            <input
              type="number"
              name="variantId"
              value={form.variantId}
              onChange={handleChange}
              placeholder="Enter variant ID"
              disabled={!!editingStock}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500 disabled:bg-gray-50
                disabled:text-gray-400"
            />
            {editingStock && (
              <p className="text-xs text-gray-400 mt-1">
                Variant: {editingStock.variantName}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="e.g. 100"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              placeholder="e.g. BATCH-2024-001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white
                font-medium py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : editingStock ? 'Update Stock' : 'Add Stock'}
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