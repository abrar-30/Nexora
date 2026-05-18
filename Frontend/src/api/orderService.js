import axiosInstance from './axiosInstance'

export const orderService = {
  create: async (orderData) => {
    // orderData: { userId, shippingAddress, orderItems }
    const response = await axiosInstance.post('/orders', orderData)
    return response.data
  },

  getAll: async () => {
    const response = await axiosInstance.get('/orders')
    return response.data
  },

  getById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`)
    return response.data
  },

  getByUserId: async (userId) => {
    const response = await axiosInstance.get(`/orders/user/${userId}`)
    return response.data
  },
  getMyOrders: async () => {
    try {
      console.log('Attempting to fetch orders from: /orders/user/me');
      const response = await axiosInstance.get('/orders/user/me');
      
      // Look at the structure here: is it response.data.data or just response.data?
      console.log('Full Axios Response:', response);
      return response.data; 
    } catch (error) {
      console.error('Error in getMyOrders service:', error.response || error);
      throw error; // Re-throw so the component can catch it too
    }
  },

  getByOrderNumber: async (orderNumber) => {
    const response = await axiosInstance.get(`/orders/number/${orderNumber}`)
    return response.data
  },

  updateStatus: async (orderId, orderData) => {
    const response = await axiosInstance.put(`/orders/${orderId}`, orderData)
    return response.data
  },

  delete: async (orderId) => {
    const response = await axiosInstance.delete(`/orders/${orderId}`)
    return response.data
  },
}