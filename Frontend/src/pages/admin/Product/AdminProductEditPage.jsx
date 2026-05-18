import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "../../../api/productService";
import { categoryService } from "../../../api/categoryService";
import { brandService } from "../../../api/brandService";
import { unitService } from "../../../api/unitService";
import { taxSlabService } from "../../../api/taxSlabService";
import toast from "react-hot-toast";
import Spinner from "../../../components/ui/Spinner";
import AdminProductVariantsEdit from "../../../components/admin/AdminProductVariantsEdit";

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
  });

  const [productData, setProductData] = useState(null)
  const [variants, setVariants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxSlabs, setTaxSlabs] = useState([]);

  // ✅ Load dropdowns
  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      brandService.getAll(),
      unitService.getAll(),
      taxSlabService.getAll(),
    ])
      .then(([cats, brds, unts, taxes]) => {
        setCategories(Array.isArray(cats?.data) ? cats.data : Array.isArray(cats) ? cats : [])
        setBrands(Array.isArray(brds?.data) ? brds.data : Array.isArray(brds) ? brds : [])
        setUnits(Array.isArray(unts?.data) ? unts.data : Array.isArray(unts) ? unts : [])
        setTaxSlabs(Array.isArray(taxes?.data) ? taxes.data : Array.isArray(taxes) ? taxes : [])
      })
      .catch(() => toast.error("Failed to load dropdowns"));
  }, []);

  // ✅ Load product
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService
      .getById(id)
      .then((res) => {
        const p = res.data
        setProductData(p)
        setForm({
          productName: p.productName || "",
          productDisplayName: p.productDisplayName || "",
          description: p.description || "",
          basePrice: p.basePrice || "",
          mrp: p.mrp || "",
          purchasePrice: p.purchasePrice || "",
          landingCost: p.landingCost || "",
          itemCode: p.itemCode || "",
          // IDs will be matched after dropdowns load
          brandId: "",
          categoryId: "",
          unitId: "",
          taxSlabId: "",
        })
        setImagePreview(p.mainImageUrl)
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Match dropdown IDs by name once both product + dropdowns are ready
  useEffect(() => {
    if (!productData || !brands.length) return

    const matchedBrand    = brands.find(b => b.brandName === productData.brandName)
    const matchedCategory = categories.find(c => c.categoryName === productData.categoryName)
    const matchedUnit     = units.find(u => u.unitName === productData.unitName)
    const matchedTaxSlab  = taxSlabs.find(t => t.taxName === productData.taxSlabName)

    setForm(prev => ({
      ...prev,
      brandId:    matchedBrand?.brandId       ? String(matchedBrand.brandId)       : '',
      categoryId: matchedCategory?.categoryId ? String(matchedCategory.categoryId) : '',
      unitId:     matchedUnit?.unitId         ? String(matchedUnit.unitId)         : '',
      taxSlabId:  matchedTaxSlab?.taxSlabId   ? String(matchedTaxSlab.taxSlabId)   : '',
    }))
  }, [productData, brands, categories, units, taxSlabs])

  // ✅ Load variants separately
  useEffect(() => {
    if (!id) return;
    productService
      .getVariantsByProductId(id)
      .then((res) => {
        const data = res?.data?.data || res?.data || res || []
        setVariants(
          Array.isArray(data)
            ? data.map((v) => ({
                variantId: v.variantId || null,
                variantName: v.variantName || "",
                itemCode: v.itemCode || "",
                variantPrice: v.variantPrice || "",
                mrp: v.mrp || "",
                purchasePrice: v.purchasePrice || "",
                landingCost: v.landingCost || "",
              }))
            : []
        );
      })
      .catch(() => toast.error("Failed to load variants"));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName.trim()) return toast.error("Product name required");
    if (!form.basePrice) return toast.error("Base price required");
    if (!form.brandId) return toast.error("Brand is required");

    const payload = {
      ...form,
      basePrice:     Number(form.basePrice),
      mrp:           form.mrp           ? Number(form.mrp)           : null,
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      landingCost:   form.landingCost   ? Number(form.landingCost)   : null,
      brandId:       Number(form.brandId),
      categoryId:    form.categoryId    ? Number(form.categoryId)    : null,
      unitId:        form.unitId        ? Number(form.unitId)        : null,
      taxSlabId:     form.taxSlabId     ? Number(form.taxSlabId)     : null,
      variants: variants.map((v) => ({
        variantId:     v.variantId || null,
        variantName:   v.variantName,
        itemCode:      v.itemCode,
        variantPrice:  Number(v.variantPrice),
        mrp:           v.mrp           ? Number(v.mrp)           : null,
        purchasePrice: v.purchasePrice ? Number(v.purchasePrice) : null,
        landingCost:   v.landingCost   ? Number(v.landingCost)   : null,
      })),
    };

    try {
      setSaving(true);
      await productService.update(id, payload, imageFile);
      toast.success("Product updated");
      navigate("/admin/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-400 text-sm mt-1">Update product details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Image */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Product Image</h2>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300
              flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100
                text-indigo-600 text-sm font-medium px-4 py-2 rounded-xl transition">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Leave empty to keep current image
              </p>
            </div>
          </div>
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
              label="Base Price *"
              name="basePrice"
              type="number"
              value={form.basePrice}
              onChange={handleChange}
              placeholder="Selling price"
            />
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
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
                text-sm outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Brand *"
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              options={brands.map(b => ({
                value: String(b.brandId),
                label: b.brandName
              }))}
            />
            <SelectField
              label="Category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              options={categories.map(c => ({
                value: String(c.categoryId),
                label: c.categoryName
              }))}
            />
            <SelectField
              label="Unit"
              name="unitId"
              value={form.unitId}
              onChange={handleChange}
              options={units.map(u => ({
                value: String(u.unitId),
                label: u.unitName
              }))}
            />
            <SelectField
              label="Tax Slab"
              name="taxSlabId"
              value={form.taxSlabId}
              onChange={handleChange}
              options={taxSlabs.map(t => ({
                value: String(t.taxSlabId),
                label: `${t.taxName} (${t.taxPercentage}%)`
              }))}
            />
          </div>
        </div>

        {/* Variants */}
        <AdminProductVariantsEdit
          variants={variants}
          setVariants={setVariants}
          productId={id}
        />

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium
              px-8 py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="text-gray-500 hover:text-gray-700 font-medium px-6 py-3
              rounded-xl border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function FormField({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
          text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl
          text-sm outline-none focus:border-indigo-500 bg-white"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}