import axiosInstance from './axiosInstance'

export const stockTransactionService = {
  getAll: () => axiosInstance.get('/stock-transactions'),
}
