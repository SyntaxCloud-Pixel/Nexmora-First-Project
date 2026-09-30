import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase, useAuth } from 'supabase-client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.rpc('update_own_profile', {
        p_first_name: formData.first_name,
        p_last_name: formData.last_name,
        p_phone: formData.phone
      });

      if (dbError) throw dbError;
      
      // Force reload to get new profile data in context
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
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

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">First Name</label>
              <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Last Name</label>
              <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Note: To change your email, department, or role, please contact an Administrator.</p>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
