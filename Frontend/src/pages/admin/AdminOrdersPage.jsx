import { useEffect, useState } from 'react'
import { orderService } from '../../api/orderService'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await orderService.getAll()
      // Accommodate standard response payload structures
      setOrders(res.data?.data || res.data || res || [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      // Call updateStatus api. Depending on the backend, you might need to send different payload keys
      await orderService.updateStatus(orderId, { orderStatus: newStatus })
      toast.success('Order status updated successfully')
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.orderId === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o
        )
      )
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status) => {
    const s = String(status).toUpperCase()
    switch (s) {
      case 'DELIVERED': return 'text-green-700 bg-green-100'
      case 'CANCELLED': return 'text-red-700 bg-red-100'
      case 'SHIPPED': return 'text-blue-700 bg-blue-100'
      case 'CONFIRMED': return 'text-indigo-700 bg-indigo-100'
      case 'PROCESSING': return 'text-amber-700 bg-amber-100'
      default: return 'text-gray-700 bg-gray-100' // PENDING or others
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">{orders.length} total orders</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-base font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Order ID', 'Customer ID', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const status = order.orderStatus || order.status || 'PENDING'
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50/60 transition duration-200">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-600">
                          {order.orderNumber || `#${order.orderId}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        User {order.userId || 'Guest'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{Number(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        {updatingId === order.orderId ? (
                           <Spinner size="sm" />
                        ) : (
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className={`text-xs font-bold px-4 py-2 rounded-xl cursor-pointer outline-none transition-all appearance-none ${getStatusColor(status)}`}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
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
