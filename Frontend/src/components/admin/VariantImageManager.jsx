import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import Spinner from "../ui/Spinner";
import { productImageService } from "../../api/productService";

export default function VariantImageManager({ variant, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [variant.variantId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await productImageService.getImagesByVariant(
        variant.variantId,
      );
      setImages(data || []);
    } catch (err) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      // Create basic metadata for each file
      const metadata = files.map((file, index) => ({
        altText: `${variant.variantName} - ${index + 1}`,
        isPrimary: false,
        displayOrder: images.length + index,
      }));

      await productImageService.uploadMultiple(
        variant.variantId,
        files,
        metadata,
      );
      toast.success("Images uploaded successfully");
      loadImages();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
  confirmDelete(async () => {
    try {
      await productImageService.deleteImage(imageId);

      toast.success("Image removed");

      setImages((prev) =>
        prev.filter((img) => img.imageId !== imageId)
      );
    } catch (err) {
      toast.error("Delete failed");
      console.log("Delete error:", err);
    }
  });
};

  return (
    <div className="fixed inset-0 z- flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Gallery Manager
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {variant.variantName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-full text-xl transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {/* Upload Zone */}
          <div className="mb-8">
            <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Spinner />
                  <p className="text-xs font-black text-indigo-600 mt-4 animate-pulse">
                    UPLOADING TO CLOUDINARY...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    📸
                  </span>
                  <p className="text-sm font-bold text-gray-500">
                    Click to upload multiple images
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">
                    PNG, JPG or JPEG (Max 5 files at once)
                  </p>
                </div>
              )}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*"
              />
            </label>
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
              <p className="text-gray-400 font-bold italic">
                No images found for this variant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img.imageId}
                  className="group relative aspect-square bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        handleDelete(img.imageId);
                      }}
                      className="p-3 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white rounded-2xl transition-colors"
                      title="Delete Image"
                    >
                      🗑️
                    </button>
                    {img.isPrimary && (
                      <span className="absolute top-3 left-3 bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded-md uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const confirmDelete = (onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Delete this image?</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            toast.dismiss(t.id)
          }}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            onConfirm()
            toast.dismiss(t.id)
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  ))
}