import React, { useEffect, useState } from 'react';
import { supabase } from 'supabase-client';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button, Badge, Spinner, useToast } from '../components/ui';
import { Search, Plus, MoreVertical, Package, Edit } from 'lucide-react';

interface Package {
  id: string;
  package_name: string;
  description: string;
  price: number;
  duration_months: number;
  is_active: boolean;
}

export const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      showToast('Error fetching packages', 'error');
    } else {
      setPackages(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();

    const channel = supabase.channel('public:packages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, () => {
        fetchPackages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredPackages = packages.filter(pkg => 
    pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('packages')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      showToast('Error updating package status', 'error');
    } else {
      showToast('Package status updated successfully', 'success');
      fetchPackages();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage service packages and pricing plans</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search packages by name or description..."
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
                <TableHead>Package Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No packages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      {pkg.package_name}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {pkg.description || 'No description'}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      Rs {pkg.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pkg.duration_months} months</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.is_active ? 'success' : 'warning'}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Toggle Status" onClick={() => toggleStatus(pkg.id, pkg.is_active)}>
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
          Showing {filteredPackages.length} of {packages.length} packages
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
