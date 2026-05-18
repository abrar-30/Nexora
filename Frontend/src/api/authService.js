import axiosInstance from './axiosInstance'

export const authService = {
  register: async (data) => {
    // data: { firstName, lastName, email, password, phoneNumber }
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  },

  login: async (data) => {
    // data: { email, password }
    const response = await axiosInstance.post('/auth/login', data)
    console.log('Login response:', response.data)
    return response.data
  },
}