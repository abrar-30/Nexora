import axiosInstance from './axiosInstance'

export const paymentService = {
  getAll: async () => {
    const response = await axiosInstance.get('/payments')
    return response.data
  }
}
