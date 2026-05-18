import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { productService } from '../../api/productService';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesMap, setImagesMap] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      
      // If res is the full axios object, use res.data. If it's already res.data, use res.
      const ordersData = Array.isArray(res) ? res : res.data || [];
      setOrders(ordersData);

      // Fetch images for items
      const variantIds = new Set();
      ordersData.forEach(order => {
        order.orderItems?.forEach(item => {
          if (item.productVariantId) variantIds.add(item.productVariantId);
        });
      });

      if (variantIds.size > 0) {
        const imagePromises = Array.from(variantIds).map(async (id) => {
          try {
            const imgRes = await productService.getVariantImages(id);
            const imgs = imgRes.data || [];
            return { id, url: imgs.find(i => i.isPrimary)?.imageUrl || imgs?.imageUrl };
          } catch { return { id, url: null }; }
        });
        const imgsArr = await Promise.all(imagePromises);
        const map = {};
        imgsArr.forEach(i => map[i.id] = i.url);
        setImagesMap(map);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header: Uses totalAmount and orderNumber from your log */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Order Placed</p>
                  <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                  <p className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                  <p className="text-sm font-bold text-indigo-600">{order.orderStatus || 'Processing'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-400">Order #</p>
                <p className="text-sm font-mono text-gray-600">{order.orderNumber}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 divide-y divide-gray-100">
              {order.orderItems?.map((item) => (
                <div key={item.orderItemId} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border flex-shrink-0">
                    {imagesMap[item.productVariantId] ? (
                      <img src={imagesMap[item.productVariantId]} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800">{item.productName}</h4>
                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm font-bold text-indigo-600">₹{item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}