import axiosInstance from './axiosInstance'

export const addressService = {
  getAll: async () => {
    const response = await axiosInstance.get('/addresses/my-addresses')
    return response.data
  },

  getById: async (addressId) => {
    const response = await axiosInstance.get(`/addresses/${addressId}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/addresses/create', data)
    return response.data
  },

  update: async (addressId, data) => {
    const response = await axiosInstance.put(`/addresses/update/${addressId}`, data)
    return response.data
  },

  delete: async (addressId) => {
    const response = await axiosInstance.delete(`/addresses/delete/${addressId}`)
    return response.data
  },

  setDefault: async (addressId) => {
    const response = await axiosInstance.patch(`/addresses/set-default/${addressId}`)
    return response.data
  },
}