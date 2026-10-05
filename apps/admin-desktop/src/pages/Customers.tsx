import React, { useEffect, useState, useRef } from 'react';
import { supabase } from 'supabase-client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button, Badge, Spinner, useToast, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui';
import { Search, Plus, MoreVertical, Eye, Trash2, UserX, UserCheck } from 'lucide-react';

interface Customer {
  id: string;
  customer_code: string;
  customer_name: string;
  phone: string;
  alternate_phone: string | null;
  address: string | null;
  account_status: string;
  payment_status: string;
  monthly_cost: number;
  due_date: number | null;
  installation_date: string | null;
  notes: string | null;
  created_at: string;
  custom_package_name?: string;
  package?: { package_name: string };
}

// --- Dropdown Menu ---
interface ActionMenuProps {
  customer: Customer;
  onViewDetails: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ customer, onViewDetails, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        aria-label="Customer actions"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white shadow-lg z-50 py-1">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => { onViewDetails(customer); setOpen(false); }}
          >
            <Eye className="h-4 w-4 text-gray-500" />
            View Details
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
              customer.account_status === 'ACTIVE'
                ? 'text-amber-700 hover:bg-amber-50'
                : 'text-green-700 hover:bg-green-50'
            }`}
            onClick={() => { onToggleStatus(customer); setOpen(false); }}
          >
            {customer.account_status === 'ACTIVE' ? (
              <><UserX className="h-4 w-4" /> Deactivate</>
            ) : (
              <><UserCheck className="h-4 w-4" /> Activate</>
            )}
          </button>

          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
            onClick={() => { onDelete(customer); setOpen(false); }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Customer
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*, package:packages(package_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      showToast('Error fetching customers', 'error');
    } else {
      setCustomers(data as any);
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

  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.account_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const { error } = await supabase
      .from('customers')
      .update({ account_status: newStatus })
      .eq('id', customer.id);

    if (error) {
      console.error('Error updating customer status:', error);
      showToast('Failed to update customer status', 'error');
    } else {
      showToast(`Customer ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`, 'success');
      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? { ...c, account_status: newStatus } : c)
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      console.error('Error deleting customer:', error);
      showToast('Failed to delete customer: ' + error.message, 'error');
    } else {
      showToast('Customer deleted successfully', 'success');
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your client accounts and subscriptions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, code, or phone..."
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
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm">{customer.customer_code}</TableCell>
                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                    <TableCell className="text-gray-600 hidden sm:table-cell">{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{customer.package?.package_name || customer.custom_package_name || 'No package'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.account_status === 'ACTIVE' ? 'success' : 'warning'}>
                        {customer.account_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionMenu
                          customer={customer}
                          onViewDetails={setDetailCustomer}
                          onToggleStatus={handleToggleStatus}
                          onDelete={setDeleteTarget}
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
          Showing {filteredCustomers.length} of {customers.length} customers
        </span>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        )}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={!!detailCustomer} onOpenChange={() => setDetailCustomer(null)}>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {detailCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Code</p>
                  <p className="font-medium font-mono">{detailCustomer.customer_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{detailCustomer.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{detailCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alternate Phone</p>
                  <p className="font-medium">{detailCustomer.alternate_phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <Badge variant="secondary">{detailCustomer.package?.package_name || detailCustomer.custom_package_name || 'No package'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="font-semibold text-green-600">${detailCustomer.monthly_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <Badge variant={detailCustomer.account_status === 'ACTIVE' ? 'success' : 'warning'}>
                    {detailCustomer.account_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge variant={detailCustomer.payment_status === 'UP_TO_DATE' ? 'success' : 'destructive'}>
                    {detailCustomer.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date (Day)</p>
                  <p className="font-medium">{detailCustomer.due_date ? `${detailCustomer.due_date}th of each month` : '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Installation Date</p>
                  <p className="font-medium">{detailCustomer.installation_date ? new Date(detailCustomer.installation_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-700">{detailCustomer.address || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-gray-700">{detailCustomer.notes || 'No notes'}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t">
                Created {new Date(detailCustomer.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailCustomer(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {deleteTarget && (
            <div className="space-y-3">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget.customer_name}</span> ({deleteTarget.customer_code})?
              </p>
              <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                This action cannot be undone. All payment records associated with this customer will also be permanently deleted.
              </p>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
