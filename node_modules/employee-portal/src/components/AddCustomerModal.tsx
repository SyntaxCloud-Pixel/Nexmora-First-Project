import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, useAuth } from 'supabase-client';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_code: '',
    customer_name: '',
    phone: '',
    alternate_phone: '',
    address: '',
    custom_package_name: '',
    monthly_cost: '',
    installation_date: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('customers').insert([{
        ...formData,
        assigned_employee_id: profile?.id,
      }]);

      if (dbError) throw dbError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Customer</h3>
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Customer Name *</label>
              <input required name="customer_name" value={formData.customer_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Customer Code *</label>
              <input required name="customer_code" value={formData.customer_code} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Phone *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Alternate Phone</label>
              <input name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-900">Address *</label>
              <input required name="address" value={formData.address} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Package Name *</label>
              <input required type="text" placeholder="e.g. 10 Mbps Standard" name="custom_package_name" value={formData.custom_package_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Monthly Cost (PKR) *</label>
              <input required type="number" name="monthly_cost" value={formData.monthly_cost} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Installation Date</label>
              <input type="date" name="installation_date" value={formData.installation_date} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
              {loading ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
