import React, { useEffect, useState } from 'react';
import { supabase } from 'supabase-client';
import { PlusCircle, FileText } from 'lucide-react';
import { AddPaymentModal } from '../components/AddPaymentModal';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payments')
      .select('*, customer:customers(customer_name)')
      .order('payment_date', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();

    const channel = supabase.channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payments Ledger</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Record Payment
        </button>
      </div>

      <AddPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchPayments()}
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{p.payment_date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.customer?.customer_name}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">Rs {p.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.payment_method}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.payment_status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        p.payment_status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <FileText className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No payments recorded yet.
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
