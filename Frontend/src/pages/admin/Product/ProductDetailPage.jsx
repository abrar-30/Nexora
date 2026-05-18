import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../../api/productService';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';
import ProductVariantSection from '../../../components/admin/ProductVariantSection';

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      // Adjust based on your ApiResponse structure
      setProduct(res.data?.data || res.data); 
    } catch (err) {
      toast.error("Failed to load product details");
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20"><Spinner /></div>;
  if (!product) return <div className="p-20 text-center">Product not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs & Actions */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/admin/products')}
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-2"
        >
          ← Back to Catalog
        </button>
        <button 
          onClick={() => navigate(`/admin/products/edit/${id}`)}
          className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition"
        >
          Edit Basic Info
        </button>
      </div>

      {/* Product Summary Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8">
        <div className="w-48 h-48 rounded-2xl overflow-hidden border bg-gray-50 flex-shrink-0">
          <img 
            src={product.mainImageUrl || 'https://via.placeholder.com/200'} 
            className="w-full h-full object-contain p-2" 
            alt="" 
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {product.categoryName}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{product.productDisplayName}</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">{product.description || 'No description provided.'}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Brand</p>
              <p className="font-semibold">{product.brandName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Base Price</p>
              <p className="font-semibold text-indigo-600">₹{product.basePrice?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Tax Slab</p>
              <p className="font-semibold">{product.taxSlabName || '0%'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Product ID</p>
              <p className="font-mono text-xs text-gray-500">#{product.productId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- VARIANT MANAGEMENT SECTION --- */}
      <ProductVariantSection productId={id} />
    </div>
  );
}