import axiosInstance from './axiosInstance'

export const brandService = {
  getAll: async () => {
    const response = await axiosInstance.get('/brands')
    
    return response.data
  },
  create: async (data) => {
    const response = await axiosInstance.post('/brands/create', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/brands/update/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/brands/delete/${id}`)
    return response.data
  },
  getById: async (id) => {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
}
}