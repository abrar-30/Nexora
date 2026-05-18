import { createContext, useState, useEffect } from 'react'
import { authService } from '../api/authService'
import { saveToken, saveUserId, getUserId, removeToken, getToken, getDecodedToken, isTokenExpired, getUserRole } from '../utils/tokenHelpers'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const buildUser = (responseUser, decoded, storedUserId) => ({
    ...(responseUser || {}),
    email: responseUser?.email || decoded?.sub,
    userId:
      responseUser?.id ??
      responseUser?.userId ??
      storedUserId ??
      decoded?.userId ??
      decoded?.id ??
      decoded?.user_id ??
      null,
  })

  // On app load — restore session from localStorage
  useEffect(() => {
    const storedToken = getToken()
    if (storedToken && !isTokenExpired()) {
      const decoded = getDecodedToken()
      const storedUserId = getUserId()
      setToken(storedToken)
      setRole(getUserRole())
      setUser(buildUser(null, decoded, storedUserId))
    } else {
      removeToken()
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const response = await authService.login(credentials)
    const jwt = response.token
    saveToken(jwt)
    saveUserId(response.user?.id)
    const decoded = getDecodedToken()
    setToken(jwt)
    setRole(getUserRole())
    setUser(buildUser(response.user, decoded, response.user?.id))
    return decoded?.role
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    const jwt = response.token
    saveToken(jwt)
    saveUserId(response.user?.id)
    const decoded = getDecodedToken()
    setToken(jwt)
    setRole(getUserRole())
    setUser(buildUser(response.user, decoded, response.user?.id))
    return decoded?.role
  }

  const logout = () => {
    removeToken()
    setToken(null)
    setUser(null)
    setRole(null)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    token,
    role,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: role === 'ADMIN',
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}

    </AuthContext.Provider>
  )
}