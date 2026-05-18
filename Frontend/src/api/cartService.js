import axiosInstance from './axiosInstance'

export const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart')
    return response.data
  },

  getCartItems: async () => {
    const response = await axiosInstance.get('/cart/items')
    return response.data
  },

  manageItem: async (variantId, quantity) => {
    const response = await axiosInstance.post('/cart/manage', null, {
      params: { variantId, quantity },
    })
    return response.data
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/cart/clear')
    return response.data
  },
}