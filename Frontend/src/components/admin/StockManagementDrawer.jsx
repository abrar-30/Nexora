import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '../ui/Spinner';
import { stockService } from '../../api/stockService';

export default function StockManagementDrawer({ variant, onClose }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Updated Form State to match StockMasterRequestDTO
  const [formData, setFormData] = useState({
    quantity: '',
    expiryDate: '',
    batchNumber: ''
  });

  useEffect(() => {
    if (variant?.variantId) loadStockRecords();
  }, [variant?.variantId]);

  const loadStockRecords = async () => {
    try {
      setLoading(true);
      const res = await stockService.getByVariant(variant.variantId);
      
      // CRITICAL: Check your browser console. 
      // If res.data is the list, use res.data. 
      // If res.data has a 'data' field, use res.data.data.
      console.log("Full API Response:", res);
      const fetchedData = res.data?.data || res.data || [];
      setStocks(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err) {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const payload = {
      variantId: variant.variantId,
      quantity: parseFloat(formData.quantity),
      expiryDate: formData.expiryDate || null,
      batchNumber: formData.batchNumber || `BN-${Date.now()}`
    };

    try {
      await stockService.create(payload);
      toast.success("Stock batch created");
      setFormData({ quantity: '', expiryDate: '', batchNumber: '' });
      setShowAddForm(false);
      loadStockRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating stock");
    }
  };

  return (
    <div className="fixed inset-0 z- flex justify-end">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Stock Ledger</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">✕</button>
        </div>

        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase mb-6"
          >
            + New Batch Entry
          </button>
        ) : (
          <form onSubmit={handleAddStock} className="bg-gray-50 p-6 rounded-[2rem] mb-6 space-y-4 border border-gray-100 shadow-inner">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Quantity (Double)</label>
                <input 
                  type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Expiry Date</label>
                <input 
                  type="date" className="w-full px-4 py-3 rounded-xl border mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Batch #</label>
                <input 
                  type="text" placeholder="Auto-gen if empty" className="w-full px-4 py-3 rounded-xl border mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Save Record</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-white border py-3 rounded-xl text-[10px] font-black uppercase text-gray-400">Cancel</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {loading ? <Spinner /> : stocks.length === 0 ? (
            <p className="text-center text-gray-400 py-20 font-medium italic">No ledger entries found.</p>
          ) : (
            stocks.map((stock) => (
              <div key={stock.stockId} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-between">
                <div>
                  <p className="font-black text-gray-900 text-lg">+{stock.quantity}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                    {stock.batchNumber || 'No Batch Info'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-600">
                    {stock.createdAt ? new Date(stock.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {stock.expiryDate && (
                    <p className="text-[8px] text-red-400 font-bold uppercase mt-1">Exp: {stock.expiryDate}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}