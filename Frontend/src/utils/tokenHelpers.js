import { jwtDecode } from 'jwt-decode'

export function saveToken(token) {
  localStorage.setItem('token', token)
}

export function saveUserId(userId) {
  if (userId === null || userId === undefined || userId === '') {
    localStorage.removeItem('userId')
    return
  }

  localStorage.setItem('userId', String(userId))
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getUserId() {
  const storedUserId = localStorage.getItem('userId')
  if (!storedUserId) return null

  const parsedUserId = Number(storedUserId)
  return Number.isNaN(parsedUserId) ? storedUserId : parsedUserId
}

export function removeToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}

export function getDecodedToken() {
  const token = getToken()
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export function getUserRole() {
  const decoded = getDecodedToken()
  if (!decoded?.role) return null
  return decoded.role.replace('ROLE_', '')
}

export function isTokenExpired() {
  const decoded = getDecodedToken()
  if (!decoded) return true
  return decoded.exp * 1000 < Date.now()
}

export function isAuthenticated() {
  return !!getToken() && !isTokenExpired()
}