import axiosInstance from "./axiosInstance";

export const taxSlabService = {
  getAll: async () => {
    const response = await axiosInstance.get("/taxslabs");
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/taxslabs/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post("/taxslabs", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/taxslabs/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/taxslabs/${id}`);
    return response.data;
  },
};
