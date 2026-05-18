import { useState,useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AddressesSection from '../../components/profile/AddressesSection'


import OrdersSection from '../../components/order/OrderSection'
// import OrderCard from '../../components/order/OrderCard'
const TABS = ['Profile', 'Addresses', 'Orders']

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center
          justify-center text-indigo-700 font-bold text-2xl flex-shrink-0">
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer
              ${activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Profile' && <ProfileSection />}
      {activeTab === 'Addresses' && <AddressesSection />}
      {activeTab === 'Orders' && <OrdersSection />}
    </div>
  )
}

// ─── Profile Section ──────────────────────────────────────────
function ProfileSection() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    // TODO: wire to user update API when available
    setEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-800">Personal Info</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700
              border border-indigo-200 px-4 py-1.5 rounded-lg transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
            <Field
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <Field
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
                font-medium px-5 py-2 rounded-xl transition cursor-pointer"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 border border-gray-200 px-5 py-2
                rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <InfoRow label="First Name" value={user?.firstName} />
          <InfoRow label="Last Name" value={user?.lastName} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Phone" value={user?.phoneNumber || '—'} />
        </div>
      )}
    </div>
  )
}

// ─── Orders Section (placeholder) ────────────────────────────

<OrdersSection />

// ─── Helpers ──────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center py-3 border-b border-gray-50 last:border-0">
      <span className="w-32 text-sm text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

function Field({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
          outline-none focus:border-indigo-500"
      />
    </div>
  )
}