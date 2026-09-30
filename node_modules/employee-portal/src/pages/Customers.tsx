import React, { useEffect, useState } from 'react';
import { supabase } from 'supabase-client';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { AddCustomerModal } from '../components/AddCustomerModal';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    
    const channel = supabase.channel('public:customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        fetchCustomers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    c.customer_code.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const toggleCustomerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await supabase.from('customers').update({ account_status: newStatus }).eq('id', id);
  };

  const deleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await supabase.from('customers').delete().eq('id', id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchCustomers()} 
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{c.customer_name}</div>
                      <div className="text-sm text-gray-500 font-mono">{c.customer_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.custom_package_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.account_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        c.account_status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {c.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleCustomerStatus(c.id, c.account_status)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                        {c.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => deleteCustomer(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
