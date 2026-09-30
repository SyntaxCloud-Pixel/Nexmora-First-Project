import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, useAuth } from 'supabase-client';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    employee_code: '',
    phone: '',
    department: '',
    designation: '',
    role_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      supabase.from('roles').select('id, name').then(({ data }) => {
        if (data) {
          setRoles(data);
          if (data.length > 0) setFormData(prev => ({ ...prev, role_id: data.find(r => r.name === 'EMPLOYEE')?.id || data[0].id }));
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
      const { error: funcError } = await supabase.functions.invoke('create-employee', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to create employee');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
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
          <h3 className="text-xl font-semibold text-gray-900">Add New Employee</h3>
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
              <label className="mb-2 block text-sm font-medium text-gray-900">First Name *</label>
              <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Last Name *</label>
              <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Temporary Password *</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} minLength={6} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Employee Code</label>
              <input name="employee_code" value={formData.employee_code} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">System Role *</label>
              <select required name="role_id" value={formData.role_id} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Department</label>
              <input name="department" value={formData.department} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
