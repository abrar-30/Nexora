import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

// ✅ Field is outside RegisterPage — defined once, never recreated
function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
          ${error
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-300 focus:border-indigo-500'}
        `}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName) errs.firstName = 'First name is required'
    if (!form.lastName) errs.lastName = 'Last name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!form.phoneNumber) errs.phoneNumber = 'Phone number is required'
    return errs
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-200 p-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              name="firstName" label="First name" placeholder="John"
              value={form.firstName} onChange={handleChange} error={errors.firstName}
            />
            <Field
              name="lastName" label="Last name" placeholder="Doe"
              value={form.lastName} onChange={handleChange} error={errors.lastName}
            />
          </div>

          <Field
            name="email" label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} error={errors.email}
          />
          <Field
            name="phoneNumber" label="Phone number" placeholder="+91 9876543210"
            value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber}
          />
          <Field
            name="password" label="Password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
              text-white font-medium py-2.5 rounded-lg text-sm transition mt-2 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
