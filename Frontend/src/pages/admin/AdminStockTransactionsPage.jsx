import { useEffect, useState } from 'react'
import { stockTransactionService } from '../../api/stockTransactionService'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminStockTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await stockTransactionService.getAll()
      setTransactions(res.data?.data || res.data || []) // Handle ApiResponse structure if necessary
    } catch {
      toast.error('Failed to load stock transactions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transactions</h1>
          <p className="text-gray-400 text-sm mt-1">{transactions.length} entries</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">No stock transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Variant ID', 'In', 'Out', 'Cost/Price', 'Description', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                      text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.stockTransactionId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{t.stockTransactionId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {t.variantId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600">
                        {t.inQuantity > 0 ? `+${t.inQuantity}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-500">
                        {t.outQuantity > 0 ? `-${t.outQuantity}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="text-xs">
                        {t.landingCost ? `Cost: ₹${t.landingCost}` : ''}
                      </div>
                      <div className="text-xs">
                        {t.sellingPrice ? `Price: ₹${t.sellingPrice}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.description || '—'}
                      {t.orderId && <p className="text-xs mt-0.5 text-indigo-500">Order #{t.orderId}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
