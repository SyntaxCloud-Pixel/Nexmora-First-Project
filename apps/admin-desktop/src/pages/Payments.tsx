import React, { useEffect, useState, useRef } from 'react';
import { supabase } from 'supabase-client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button, Badge, Spinner, useToast, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui';
import { Search, Plus, MoreVertical, DollarSign, Calendar, Eye, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface Payment {
  id: string;
  payment_date: string;
  due_date: string | null;
  amount: number;
  payment_method: string;
  payment_status: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  customer?: { customer_name: string };
}

// --- Dropdown Menu Component (local, no extra dependency) ---
interface ActionMenuProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
  onUpdateStatus: (paymentId: string, status: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ payment, onViewDetails, onUpdateStatus }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Payment actions"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white shadow-lg z-50 py-1 animate-in fade-in">
          {/* View Details */}
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => { onViewDetails(payment); setOpen(false); }}
          >
            <Eye className="h-4 w-4 text-gray-500" />
            View Details
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-gray-100" />

          {/* Mark as Completed — show for PENDING or FAILED */}
          {(payment.payment_status === 'PENDING' || payment.payment_status === 'FAILED') && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
              onClick={() => { onUpdateStatus(payment.id, 'COMPLETED'); setOpen(false); }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as Completed
            </button>
          )}

          {/* Mark as Refunded — show for COMPLETED */}
          {payment.payment_status === 'COMPLETED' && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
              onClick={() => { onUpdateStatus(payment.id, 'REFUNDED'); setOpen(false); }}
            >
              <RotateCcw className="h-4 w-4" />
              Mark as Refunded
            </button>
          )}

          {/* Mark as Failed — show for PENDING */}
          {payment.payment_status === 'PENDING' && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              onClick={() => { onUpdateStatus(payment.id, 'FAILED'); setOpen(false); }}
            >
              <XCircle className="h-4 w-4" />
              Mark as Failed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
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

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ payment_status: newStatus })
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment status:', error);
      showToast('Failed to update payment status', 'error');
    } else {
      showToast(`Payment marked as ${newStatus.toLowerCase()}`, 'success');
      // Realtime will pick it up, but update locally for instant feedback
      setPayments(prev =>
        prev.map(p => p.id === paymentId ? { ...p, payment_status: newStatus } : p)
      );
    }
  };

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
                        <ActionMenu
                          payment={payment}
                          onViewDetails={setDetailPayment}
                          onUpdateStatus={handleUpdateStatus}
                        />
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

      {/* Payment Details Dialog */}
      <Dialog open={!!detailPayment} onOpenChange={() => setDetailPayment(null)}>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {detailPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{detailPayment.customer?.customer_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-green-600">${detailPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">{new Date(detailPayment.payment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{detailPayment.due_date ? new Date(detailPayment.due_date).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <Badge variant="secondary">{detailPayment.payment_method}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={
                      detailPayment.payment_status === 'COMPLETED' ? 'success' :
                      detailPayment.payment_status === 'PENDING' ? 'warning' :
                      'destructive'
                    }
                  >
                    {detailPayment.payment_status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-medium font-mono">{detailPayment.reference_number || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-gray-700">{detailPayment.notes || 'No notes'}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t">
                Created {new Date(detailPayment.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailPayment(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
