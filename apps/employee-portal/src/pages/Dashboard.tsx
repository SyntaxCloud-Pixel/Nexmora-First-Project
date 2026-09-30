import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'supabase-client';
import { supabase } from 'supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Building2, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui';

interface DashboardStats {
  totalCustomers: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
}

export const Dashboard: React.FC = () => {
  const { profile, role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();

    const customerChannel = supabase.channel('dashboard_customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const paymentChannel = supabase.channel('dashboard_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      // Fetch payments count
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });
      
      // Fetch completed payments count
      const { count: completedPaymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'COMPLETED');
      
      // Fetch pending payments count
      const { count: pendingPaymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'PENDING');

      setStats({
        totalCustomers: customersCount || 0,
        totalPayments: paymentsCount || 0,
        completedPayments: completedPaymentsCount || 0,
        pendingPayments: pendingPaymentsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Building2,
      color: 'bg-emerald-500',
      subtitle: 'Managed accounts',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'bg-blue-500',
      subtitle: 'All transactions',
    },
    {
      title: 'Completed',
      value: stats.completedPayments,
      icon: CheckCircle,
      color: 'bg-green-500',
      subtitle: 'Successful payments',
    },
    {
      title: 'Pending',
      value: stats.pendingPayments,
      icon: Clock,
      color: 'bg-yellow-500',
      subtitle: 'Awaiting action',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your assigned tasks and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/customers" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <div className="font-medium text-sm">View Customers</div>
                <div className="text-xs text-gray-500">Manage client accounts</div>
              </div>
            </Link>
            <Link to="/payments" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-sm">Record Payment</div>
                <div className="text-xs text-gray-500">Log new transaction</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingPayments > 0 ? (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Process pending payments</p>
                  <p className="text-xs text-gray-500">{stats.pendingPayments} payments require attention</p>
                </div>
                <Badge variant="warning">Action Required</Badge>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-gray-500">No pending tasks at the moment</p>
                </div>
                <Badge variant="success">Up to Date</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant={profile?.account_status === 'ACTIVE' ? 'success' : 'warning'}>
                {profile?.account_status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Role</span>
              <Badge variant="secondary">{role}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium">{profile?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
