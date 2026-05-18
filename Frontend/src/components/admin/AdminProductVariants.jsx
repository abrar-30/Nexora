import React from "react";

const EMPTY_VARIANT = {
  variantName: "",
  itemCode: "",
  variantPrice: "",
  mrp: "",
  purchasePrice: "",
  landingCost: "",
  quantity: "",
  expiryDate: "",
};

export default function AdminProductVariants({ variants = [], setVariants }) {
  const handleChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleAdd = () => {
    setVariants([...variants, { ...EMPTY_VARIANT }]);
  };

  const handleRemove = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-800">Variants & Stock</h2>
          <p className="text-xs text-gray-500">
            Add options like size, color, etc.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm"
        >
          + Add Variant
        </button>
      </div>

      {/* Empty State */}
      {variants.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-xl text-gray-400">
          No variants added yet
        </div>
      )}

      {/* Variants List */}
      <div className="space-y-4">
        {variants.map((v, index) => (
          <div
            key={index}
            className="relative bg-gray-50 border border-gray-200 p-4 rounded-xl"
          >
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg"
            >
              &times;
            </button>

            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Variant {index + 1}
            </h3>

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Name *"
                value={v.variantName}
                onChange={(e) =>
                  handleChange(index, "variantName", e.target.value)
                }
              />
              <Input
                label="Item Code *"
                value={v.itemCode}
                onChange={(e) =>
                  handleChange(index, "itemCode", e.target.value)
                }
              />
              <Input
                label="Price *"
                type="number"
                value={v.variantPrice}
                onChange={(e) =>
                  handleChange(index, "variantPrice", e.target.value)
                }
              />
              <Input
                label="Stock *"
                type="number"
                value={v.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", e.target.value)
                }
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <Input
                label="MRP"
                type="number"
                value={v.mrp}
                onChange={(e) =>
                  handleChange(index, "mrp", e.target.value)
                }
              />
              <Input
                label="Purchase Price"
                type="number"
                value={v.purchasePrice}
                onChange={(e) =>
                  handleChange(index, "purchasePrice", e.target.value)
                }
              />
              <Input
                label="Landing Cost"
                type="number"
                value={v.landingCost}
                onChange={(e) =>
                  handleChange(index, "landingCost", e.target.value)
                }
              />
              <Input
                label="Expiry Date"
                type="date"
                value={v.expiryDate}
                onChange={(e) =>
                  handleChange(index, "expiryDate", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable Input Component
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}