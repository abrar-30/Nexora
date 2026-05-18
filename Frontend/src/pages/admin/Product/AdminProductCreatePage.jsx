import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../../api/productService";
import { categoryService } from "../../../api/categoryService";
import { brandService } from "../../../api/brandService";
import { unitService } from "../../../api/unitService";
import { taxSlabService } from "../../../api/taxSlabService";
import AdminProductVariants from "../../../components/admin/AdminProductVariants";
import Spinner from "../../../components/ui/Spinner";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  productName: "",
  productDisplayName: "",
  description: "",
  basePrice: "",
  mrp: "",
  purchasePrice: "",
  landingCost: "",
  itemCode: "",
  brandId: "",
  categoryId: "",
  unitId: "",
  taxSlabId: "",
};

export default function AdminProductCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxSlabs, setTaxSlabs] = useState([]);

  // Variants
  const [variants, setVariants] = useState([]);

  // Load dropdowns
  useEffect(() => {
    setLoading(true);
    Promise.all([
      categoryService.getAll(),
      brandService.getAll(),
      unitService.getAll(),
      taxSlabService.getAll(),
    ])
      .then(([cats, brds, unts, taxes]) => {
        setCategories(Array.isArray(cats?.data) ? cats.data : []);
        setBrands(Array.isArray(brds?.data) ? brds.data : []);
        console.log('Fetched units:', unts);
        console.log('Fetched tax slabs:', taxes);
        console.log('Brands:', brds);
        setUnits(Array.isArray(unts?.data) ? unts.data : []);
        setTaxSlabs(Array.isArray(taxes?.data) ? taxes.data : []);
      })
      .catch(() => toast.error("Failed to load dropdown data"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid image type. JPG, PNG, WEBP allowed.");
      return;
    }
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.productName.trim()) return toast.error("Product name required");
    if (!form.basePrice) return toast.error("Base price required");
    if (!form.brandId) return toast.error("Brand required");
    if (!imageFile) return toast.error("Product image required");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.variantName.trim())
        return toast.error(`Variant ${i + 1} name required`);
      if (!v.itemCode.trim())
        return toast.error(`Variant ${i + 1} item code required`);
      if (!v.variantPrice) return toast.error(`Variant ${i + 1} price required`);
      if (v.quantity === "" || v.quantity < 0)
        return toast.error(`Variant ${i + 1} quantity invalid`);
    }

    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      mrp: form.mrp ? Number(form.mrp) : null,
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      landingCost: form.landingCost ? Number(form.landingCost) : null,
      brandId: Number(form.brandId),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      unitId: form.unitId ? Number(form.unitId) : null,
      taxSlabId: form.taxSlabId ? Number(form.taxSlabId) : null,
      variants: variants.map((v) => ({
        ...v,
        variantPrice: Number(v.variantPrice),
        quantity: Number(v.quantity),
        mrp: v.mrp ? Number(v.mrp) : null,
        purchasePrice: v.purchasePrice ? Number(v.purchasePrice) : null,
        landingCost: v.landingCost ? Number(v.landingCost) : null,
        expiryDate: v.expiryDate || null,
      })),
    };

    try {
      setSaving(true);
      await productService.create(payload, imageFile);
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div className="bg-white border p-6 rounded-xl flex items-center gap-6">
          <div className="w-28 h-28 border-dashed border-2 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-3xl">📦</span>
            )}
          </div>
          <label className="cursor-pointer text-indigo-600 px-4 py-2 border rounded">
            {imagePreview ? "Change Image" : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Basic Info */}
<div className="bg-white border border-gray-200 rounded-2xl p-6">
  <h2 className="font-semibold text-gray-800 mb-4">Basic Info</h2>

  <div className="grid grid-cols-2 gap-4">
    <FormField
      label="Product Name *"
      name="productName"
      value={form.productName}
      onChange={handleChange}
      placeholder="Internal name"
    />

    <FormField
      label="Display Name"
      name="productDisplayName"
      value={form.productDisplayName}
      onChange={handleChange}
      placeholder="Shown to customers"
    />

    <FormField
      label="Item Code / SKU"
      name="itemCode"
      value={form.itemCode}
      onChange={handleChange}
      placeholder="e.g. PROD-001"
    />

    <FormField
      label="Base Price *(without tax)"
      name="basePrice"
      type="number"
      value={form.basePrice}
      onChange={handleChange}
      placeholder="Selling price"
    />
  </div>

  <div className="mt-4">
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Description
    </label>
    <textarea
      name="description"
      value={form.description}
      onChange={handleChange}
      placeholder="Product description"
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
      outline-none focus:border-indigo-500 resize-none"
    />
  </div>
</div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <FormField
            label="MRP"
            name="mrp"
            type="number"
            value={form.mrp}
            onChange={handleChange}
            placeholder="Max retail price"
          />
          <FormField
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            value={form.purchasePrice}
            onChange={handleChange}
            placeholder="Cost price"
          />
          <FormField
            label="Landing Cost"
            name="landingCost"
            type="number"
            value={form.landingCost}
            onChange={handleChange}
            placeholder="Total landed cost"
          />
        </div>

        {/* Relations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <SelectField
            label="Brand *"
            name="brandId"
            value={form.brandId}
            onChange={handleChange}
            options={brands.map((b) => ({
              value: b.brandId,
              label: b.brandName,
            }))}
            placeholder="Select brand"
          />
          <SelectField
            label="Category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            options={categories.map((c) => ({
              value: c.categoryId,
              label: c.categoryName,
            }))}
            placeholder="Select category"
          />
          <SelectField
            label="Unit"
            name="unitId"
            value={form.unitId}
            onChange={handleChange}
            options={units.map((u) => ({
              value: u.unitId,
              label: u.unitName,
            }))}
            placeholder="Select unit"
          />
          <SelectField
            label="Tax Slab"
            name="taxSlabId"
            value={form.taxSlabId}
            onChange={handleChange}
            options={taxSlabs.map((t) => ({
              value: t.taxSlabId,
              label: `${t.taxName} (${t.taxPercentage}%)`,
            }))}
            placeholder="Select tax slab"
          />
        </div>

        {/* Variants */}
        <AdminProductVariants variants={variants} setVariants={setVariants} />

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl"
        >
          {saving ? "Saving..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────
function FormField({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}