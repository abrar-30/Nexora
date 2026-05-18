import { useEffect, useState } from 'react'
import { paymentService } from '../../api/paymentService'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await paymentService.getAll()
      // Extract array from standard ApiResponse format or fallback
      setPayments(res.data?.data || res.data || res || [])
    } catch {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const s = String(status).toUpperCase()
    if (s === 'SUCCESS' || s === 'COMPLETED') return 'text-green-700 bg-green-100'
    if (s === 'FAILED' || s === 'CANCELLED') return 'text-red-700 bg-red-100'
    if (s === 'PENDING') return 'text-amber-700 bg-amber-100'
    return 'text-gray-700 bg-gray-100'
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments Log</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">{payments.length} transactions recorded</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <Spinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-base font-medium">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Payment ID', 'Order ID', 'Method', 'Transaction ID', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => {
                  return (
                    <tr key={p.paymentId} className="hover:bg-gray-50/60 transition duration-200">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-600">
                          #{p.paymentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        Order #{p.orderId || p.order?.orderId || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {p.paymentMethod || 'STRIPE'}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {p.transactionId || '—'}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${getStatusColor(p.paymentStatus)}`}>
                            {p.paymentStatus || 'UNKNOWN'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.createdAt || p.paymentDate 
                          ? new Date(p.createdAt || p.paymentDate).toLocaleString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            }) 
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
