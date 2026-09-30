import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from 'supabase-client';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{ id: string, customer_name: string }[]>([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    payment_method: 'CASH',
    payment_status: 'COMPLETED',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      supabase.from('customers').select('id, customer_name').then(({ data }) => {
        if (data) {
          setCustomers(data);
          if (data.length > 0) setFormData(prev => ({ ...prev, customer_id: data[0].id }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('payments').insert([formData]);

      if (dbError) throw dbError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900">Record Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Customer *</label>
              <select required name="customer_id" value={formData.customer_id} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Amount (PKR) *</label>
              <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Payment Method *</label>
                <select required name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="ONLINE">Online/JazzCash</option>
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Status *</label>
                <select required name="payment_status" value={formData.payment_status} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Payment Date *</label>
              <input required type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
