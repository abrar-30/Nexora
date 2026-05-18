import axiosInstance from './axiosInstance'

export const locationService = {
  // ─── Countries ───────────────────────────────────────────
  getCountries: async () => {
    const response = await axiosInstance.get('/countries/getAll')
    return response.data
  },
  getCountryById: async (id) => {
    const response = await axiosInstance.get(`/countries/${id}`)
    return response.data
  },
  createCountry: async (data) => {
    const response = await axiosInstance.post('/countries/create', data)
    return response.data
  },
  updateCountry: async (id, data) => {
    const response = await axiosInstance.put(`/countries/update/${id}`, data)
    return response.data
  },
  deleteCountry: async (id) => {
    const response = await axiosInstance.delete(`/countries/delete/${id}`)
    return response.data
  },

  // ─── States ──────────────────────────────────────────────
  getStates: async () => {
    const response = await axiosInstance.get('/states/getAll')
    return response.data
  },
  getStatesByCountry: async (countryId) => {
    const response = await axiosInstance.get(`/states/country/${countryId}`)
    return response.data
  },
  createState: async (data) => {
    const response = await axiosInstance.post('/states/create', data)
    return response.data
  },
  updateState: async (id, data) => {
    const response = await axiosInstance.put(`/states/update/${id}`, data)
    return response.data
  },
  deleteState: async (id) => {
    const response = await axiosInstance.delete(`/states/delete/${id}`)
    return response.data
  },

  // ─── Cities ──────────────────────────────────────────────
  getCities: async () => {
    const response = await axiosInstance.get('/cities/getAll')
    return response.data
  },
  getCitiesByState: async (stateId) => {
    const response = await axiosInstance.get(`/cities/state/${stateId}`)
    return response.data
  },
  createCity: async (data) => {
    const response = await axiosInstance.post('/cities/create', data)
    return response.data
  },
  updateCity: async (id, data) => {
    const response = await axiosInstance.put(`/cities/update/${id}`, data)
    return response.data
  },
  deleteCity: async (id) => {
    const response = await axiosInstance.delete(`/cities/delete/${id}`)
    return response.data
  },
}