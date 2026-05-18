import axiosInstance from "./axiosInstance";

export const productService = {
  getAll: async () => {
    const response = await axiosInstance.get("/products/getAll");
    return response.data;
  },
  getAllActive: async () => {
    const response = await axiosInstance.get("/products/getAllActive");
    return response.data;
  },
  getVariantImages: (variantId) =>
    axiosInstance.get(`/product-images/variant/${variantId}`),

  getById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId) => {
    const response = await axiosInstance.get(
      `/products/category/${categoryId}`,
    );
    return response.data;
  },
  

  getByBrand: async (brandId) => {
    const response = await axiosInstance.get(`/products/brand/${brandId}`);
    return response.data;
  },

  getByPriceRange: async (minPrice, maxPrice) => {
    const response = await axiosInstance.get("/products/price-range", {
      params: { minPrice, maxPrice },
    });
    return response.data;
  },

  search: async (keyword) => {
    const response = await axiosInstance.get("/products/search", {
      params: { keyword },
    });
    return response.data;
  },

  getVariantsByProductId: (productId) =>
    axiosInstance.get(`/product-variants/product/${productId}/all`),

  getVariantById: (variantId) =>
    axiosInstance.get(`/product-variants/${variantId}`),

  // Admin only — uses multipart/form-data for image upload (Cloudinary)
  create: async (productData, imageFile) => {
    const formData = new FormData();
    formData.append("requestDTO", JSON.stringify(productData));
    if (imageFile) formData.append("imageFile", imageFile);

    const response = await axiosInstance.post("/products/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id, productData) => {
    const response = await axiosInstance.put(
      `/products/update/${id}`,
      productData,
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/delete/${id}`);
    return response.data;
  },
  // src/api/productService.js
  toggleStatus: async (id, isActive) => {
    // Sends as: /api/v1/products/8/status?active=true
    return await axiosInstance.patch(
      `/products/${id}/status?active=${isActive}`,
    );
  },
  // Add these to your existing productService object

createVariant: async (data) => {
  const response = await axiosInstance.post('/product-variants/create', data)
  return response.data
},

updateVariant: async (variantId, data) => {
  const response = await axiosInstance.put(`/product-variants/update/${variantId}`, data)
  return response.data
},

deleteVariant: async (variantId) => {
  const response = await axiosInstance.delete(`/product-variants/delete/${variantId}`)
  return response.data
},
};
// Add these to your productService object
export const productImageService = {
  getImagesByVariant: async (variantId) => {
    const response = await axiosInstance.get(`/product-images/variant/${variantId}`);
    return response.data; // Note: Your controller returns List directly, not ApiResponse
  },

  uploadMultiple: async (variantId, files, metadata = []) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    
    // Stringify the metadata list for the @RequestPart String metadataJson
    if (metadata.length > 0) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await axiosInstance.post(
      `/product-images/upload/multiple/${variantId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  deleteImage: async (imageId) => {
    return await axiosInstance.delete(`/product-images/${imageId}`);
  },

  updateImageMetadata: async (imageId, data) => {
    const response = await axiosInstance.put(`/product-images/${imageId}`, data);
    return response.data;
  }
};