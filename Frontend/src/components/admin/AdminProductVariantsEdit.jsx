import { useState } from "react";
import { productService } from "../../api/productService";
import toast from "react-hot-toast";

const EMPTY_VARIANT = {
  variantId: null,
  variantName: "",
  itemCode: "",
  variantPrice: "",
  mrp: "",
  purchasePrice: "",
  landingCost: "",
  shortDescription: "",
};

export default function AdminProductVariantsEdit({ variants, setVariants, productId }) {
  const [savingIndex, setSavingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

  // ─── Save (create or update) single variant ───────────────
  const handleSave = async (index) => {
    const v = variants[index];

    if (!v.variantName.trim()) return toast.error("Variant name is required");
    if (!v.variantPrice) return toast.error("Variant price is required");

    const payload = {
      productId: Number(productId),
      variantName: v.variantName,
      itemCode: v.itemCode || null,
      shortDescription: v.shortDescription || null,
      variantPrice: Number(v.variantPrice),
      mrp: v.mrp ? Number(v.mrp) : null,
      purchasePrice: v.purchasePrice ? Number(v.purchasePrice) : null,
      landingCost: v.landingCost ? Number(v.landingCost) : null,
      isActive: true,
      isDeleted: false,
    };
    console.log('Saving variant index:', index)
  console.log('variantId:', v.variantId)
  console.log('payload:', payload)
  console.log('productId prop:', productId)
    try {
      setSavingIndex(index);

      if (v.variantId) {
        // ✅ Update existing variant
        const res = await productService.updateVariant(v.variantId, payload);
        toast.success("Variant updated");

        // update variantId in local state (already has it, just refresh data)
        const updated = [...variants];
        updated[index] = { ...updated[index], ...res.data?.data || {} };
        setVariants(updated);
      } else {
        // ✅ Create new variant
        const res = await productService.createVariant(payload);
        const created = res.data?.data || res.data;
        toast.success("Variant created");

        // store returned variantId so next save becomes update
        const updated = [...variants];
        updated[index] = {
          ...updated[index],
          variantId: created.variantId,
        };
        setVariants(updated);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save variant");
    } finally {
      setSavingIndex(null);
    }
  };

  // ─── Delete variant ───────────────────────────────────────
  const handleDelete = async (index) => {
    const v = variants[index];

    if (!window.confirm(`Delete variant "${v.variantName}"?`)) return;

    // If no variantId yet → just remove from local state (never saved)
    if (!v.variantId) {
      setVariants(variants.filter((_, i) => i !== index));
      return;
    }

    try {
      setDeletingIndex(index);
      await productService.deleteVariant(v.variantId);
      toast.success("Variant deleted");
      setVariants(variants.filter((_, i) => i !== index));
    } catch {
      toast.error("Failed to delete variant");
    } finally {
      setDeletingIndex(null);
    }
  };

  // ─── Field change (local only, save on button click) ──────
  const handleChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleAdd = () => {
    setVariants([...variants, { ...EMPTY_VARIANT }]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">
          Variants
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {variants.length} total
          </span>
        </h2>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700
            px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          + Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No variants yet — click "Add Variant" to create one
        </div>
      )}

      <div className="space-y-4">
        {variants.map((v, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-4 bg-gray-50"
          >
            {/* Variant header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Variant {index + 1}
                </h3>
                {v.variantId ? (
                  <span className="text-xs text-green-600 bg-green-50
                    px-2 py-0.5 rounded-full font-medium">
                    Saved
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50
                    px-2 py-0.5 rounded-full font-medium">
                    Unsaved
                  </span>
                )}
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(index)}
                disabled={deletingIndex === index}
                className="text-xs text-red-500 hover:text-red-600 border
                  border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg
                  transition disabled:opacity-40 cursor-pointer"
              >
                {deletingIndex === index ? "Deleting..." : "Delete"}
              </button>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Variant Name *"
                value={v.variantName}
                onChange={(e) => handleChange(index, "variantName", e.target.value)}
              />
              <Input
                label="Item Code"
                value={v.itemCode}
                onChange={(e) => handleChange(index, "itemCode", e.target.value)}
              />
              <Input
                label="Price *"
                type="number"
                value={v.variantPrice}
                onChange={(e) => handleChange(index, "variantPrice", e.target.value)}
              />
              <Input
                label="MRP"
                type="number"
                value={v.mrp}
                onChange={(e) => handleChange(index, "mrp", e.target.value)}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <Input
                label="Purchase Price"
                type="number"
                value={v.purchasePrice}
                onChange={(e) => handleChange(index, "purchasePrice", e.target.value)}
              />
              <Input
                label="Landing Cost"
                type="number"
                value={v.landingCost}
                onChange={(e) => handleChange(index, "landingCost", e.target.value)}
              />
              <Input
                label="Short Description"
                value={v.shortDescription}
                onChange={(e) => handleChange(index, "shortDescription", e.target.value)}
              />
            </div>

            {/* Save button per variant */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave(index)}
                disabled={savingIndex === index}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
                  font-medium px-5 py-2 rounded-xl transition
                  disabled:opacity-50 cursor-pointer"
              >
                {savingIndex === index
                  ? "Saving..."
                  : v.variantId
                  ? "Update Variant"
                  : "Save Variant"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2
          text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}