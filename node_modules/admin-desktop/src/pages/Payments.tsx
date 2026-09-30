import React, { useEffect, useState } from 'react';
import { supabase } from 'supabase-client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button, Badge, Spinner, useToast } from '../components/ui';
import { Search, Plus, MoreVertical, DollarSign, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  customer?: { customer_name: string };
}

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*, customer:customers(customer_name)')
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      showToast('Error fetching payments', 'error');
    } else {
      setPayments(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();

    const channel = supabase.channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredPayments = payments.filter(p => 
    p.customer?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track and manage all payment transactions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">${totalAmount.toFixed(2)}</p>
          </div>
          <DollarSign className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search payments by customer, method, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(payment.payment_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{payment.customer?.customer_name || 'Unknown'}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payment.payment_status === 'COMPLETED' ? 'success' :
                          payment.payment_status === 'PENDING' ? 'warning' :
                          'destructive'
                        }
                      >
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="View details">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredPayments.length} of {payments.length} payments
        </span>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        )}
      </div>
    </div>
  );
};
