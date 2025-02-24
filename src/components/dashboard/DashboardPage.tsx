import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useContainers } from '../../hooks/useContainers';
import { usePayroll } from '../../hooks/usePayroll';
import { useQuotes } from '../../hooks/useQuotes';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  FileSpreadsheet, 
  TrendingUp,
  Clipboard,
  Bell,
  Star,
  Plus,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { containers } = useContainers();
  const { crews } = usePayroll();
  const { quotes } = useQuotes();
  const [notes, setNotes] = React.useState(() => {
    const saved = localStorage.getItem(`notes-${user?.id}`);
    return saved || '';
  });

  // Save notes to localStorage when they change
  React.useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`notes-${user.id}`, notes);
    }
  }, [notes, user?.id]);

  const roleMetrics = {
    admin: [
      {
        label: 'Total Containers',
        value: containers.length,
        icon: Package,
        color: 'bg-blue-500',
        link: '/inventory'
      },
      {
        label: 'Active Crews',
        value: crews.length,
        icon: Users,
        color: 'bg-green-500',
        link: '/crews'
      },
      {
        label: 'Pending Quotes',
        value: quotes.filter(q => q.status === 'pending').length,
        icon: FileSpreadsheet,
        color: 'bg-orange-500',
        link: '/configurator'
      }
    ],
    warehouse: [
      {
        label: 'Empty Containers',
        value: containers.filter(c => !c.itemCount).length,
        icon: Package,
        color: 'bg-red-500',
        link: '/inventory'
      },
      {
        label: 'Total Containers',
        value: containers.length,
        icon: Package,
        color: 'bg-blue-500',
        link: '/inventory'
      }
    ],
    sales: [
      {
        label: 'Active Quotes',
        value: quotes.filter(q => q.status === 'sent').length,
        icon: FileSpreadsheet,
        color: 'bg-blue-500',
        link: '/configurator'
      },
      {
        label: 'Conversion Rate',
        value: `${Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100)}%`,
        icon: TrendingUp,
        color: 'bg-green-500',
        link: '/configurator'
      }
    ],
    crew: [
      {
        label: 'Assigned Jobs',
        value: crews.find(c => 
          c.employees.some(e => e.employeeId === user?.id)
        )?.employees.find(e => e.employeeId === user?.id)?.entries.length || 0,
        icon: Clipboard,
        color: 'bg-blue-500',
        link: '/crews'
      }
    ]
  };

  const metrics = roleMetrics[user?.role || 'crew'];

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Here's what's happening in your workspace
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Link
                key={index}
                to={metric.link}
                className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`rounded-lg ${metric.color} p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transform bg-brand-orange transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Notes */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quick Notes</h2>
              <Clipboard className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your thoughts..."
              className="h-40 w-full resize-none rounded-md border-gray-300 focus:border-brand-orange focus:ring-brand-orange"
            />
          </div>

          {/* Quick Links */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
              <Star className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Link
                    key={index}
                    to={metric.link}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand-orange hover:bg-orange-50"
                  >
                    <div className={`rounded-lg ${metric.color} p-2 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-900">{metric.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {/* Placeholder for activity feed */}
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Link
                    key={index}
                    to={metric.link}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand-orange hover:bg-orange-50"
                  >
                    <div className={`rounded-lg ${metric.color} p-2 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-900">New {metric.label.split(' ').pop()}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}