import axiosInstance from './axiosInstance'

export const stockService = {
  getAll: async () => {
    const response = await axiosInstance.get('/stock-master/getAll')
    return response.data
  },

  getById: async (stockId) => {
    const response = await axiosInstance.get(`/stock-master/${stockId}`)
    return response.data
  },

  getByVariant: async (variantId) => {
    const response = await axiosInstance.get(`/stock-master/variant/${variantId}`)
    return response.data
  },

  getAvailableQty: async (variantId) => {
    const response = await axiosInstance.get(`/stock-master/variant/${variantId}/available-quantity`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/stock-master/create', data)
    return response.data
  },

  update: async (stockId, data) => {
    const response = await axiosInstance.put(`/stock-master/update/${stockId}`, data)
    return response.data
  },

  delete: async (stockId) => {
    const response = await axiosInstance.delete(`/stock-master/delete/${stockId}`)
    return response.data
  },
}