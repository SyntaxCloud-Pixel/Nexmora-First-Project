import React, { useEffect, useState } from 'react';
import { useAuth, supabase } from 'supabase-client';
import { Users, UserCheck, UserX, CreditCard } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pendingPayments: 0 });

  const fetchStats = async () => {
    const { data: profiles } = await supabase.from('profiles').select('account_status');
    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'PENDING');

    if (profiles) {
      setStats({
        total: profiles.length,
        active: profiles.filter(d => d.account_status === 'ACTIVE').length,
        inactive: profiles.filter(d => d.account_status === 'INACTIVE').length,
        pendingPayments: pendingPayments || 0
      });
    }
  };

  useEffect(() => {
    fetchStats();

    const channel1 = supabase.channel('admin_dashboard_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchStats();
      })
      .subscribe();

    const channel2 = supabase.channel('admin_dashboard_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  const statCards = [
    { title: 'Total Employees', value: stats.total, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Employees', value: stats.active, icon: UserCheck, color: 'bg-green-500' },
    { title: 'Inactive Employees', value: stats.inactive, icon: UserX, color: 'bg-red-500' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.first_name}</h2>
          <p className="text-gray-500 mt-1">Here is what's happening with your system today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={`${stat.color} text-white p-4 rounded-lg shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};
