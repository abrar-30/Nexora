import axiosInstance from "./axiosInstance";

export const unitService = {
  getAll: async () => {
    const response = await axiosInstance.get("/units");
    console.log("Units:", response); // Debug log
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/units/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post("/units", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/units/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/units/${id}`);
    return response.data;
  },
};
