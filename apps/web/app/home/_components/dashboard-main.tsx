'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Car, Calendar, FileText, Users, AlertCircle, CheckCircle, Wrench, DollarSign, Clipboard, ArrowRight } from 'lucide-react';
import CustomCard from '../../reusableComponents/CustomCard';
import { SummaryCard } from '../../reusableComponents/SummaryCard';
import Link from 'next/link';
import { useHttpService } from '../../../lib/http-service';

// Types for our data
interface VehicleStatus {
  name: string;
  value: number;
  color: string;
}

interface CustomerData {
  month: string;
  customers: number;
}

interface DashboardStats {
  vehicles: {
    total: number;
    reserved: number;
    available: number;
    oilChange: number;
  };
  customers: {
    total: number;
    blacklisted: number;
    active: number;
  };
  contracts: {
    total: number;
    open: number;
    closed: number;
  };
  finances: {
    revenue: number;
    expenses: number;
    netProfit: number;
    outstandingInvoices: number;
  };
  inspections: {
    total: number;
    completed: number;
    withDamages: number;
  };
}

export default function DashboardMain() {
  const { getRequest } = useHttpService();
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    vehicles: { total: 0, reserved: 0, available: 0, oilChange: 0 },
    customers: { total: 0, blacklisted: 0, active: 0 },
    contracts: { total: 0, open: 0, closed: 0 },
    finances: { revenue: 0, expenses: 0, netProfit: 0, outstandingInvoices: 0 },
    inspections: { total: 0, completed: 0, withDamages: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Fetch vehicle data
  const fetchVehicles = async () => {
    try {
      const response = await getRequest('/api/vehicles?limit=-1');
      if (response.success && response.data) {
        const data = response.data;

        if (data.vehicles) {
          // Count vehicles by status and get their colors
          const statusCounts: Record<string, { count: number; color: string }> = {};
          data.vehicles.forEach((vehicle: any) => {

            const status = vehicle.status?.name || 'Unknown';
            const color = vehicle.status?.color || '#6B7280';

            if (!statusCounts[status]) {
              statusCounts[status] = { count: 0, color };
            }
            statusCounts[status].count += 1;
          });

          // Map to our chart format using the actual status colors
          const vehicleStatusData: VehicleStatus[] = Object.entries(statusCounts).map(([name, data]) => ({
            name,
            value: data.count,
            color: data.color
          }));

          setVehicleStatuses(vehicleStatusData);

          // Calculate vehicle stats
          const totalVehicles = data.vehicles.length;
          const reserved = statusCounts['Reserved']?.count || 0;
          const available = statusCounts['Available']?.count || 0;
          const oilChange = statusCounts['Needs Maintenance']?.count || 0;

          setStats(prev => ({
            ...prev,
            vehicles: { total: totalVehicles, reserved, available, oilChange }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch customer data
  const fetchCustomers = async () => {
    try {
      const response = await getRequest('/api/customers?limit=-1');
      if (response.success && response.data) {
        const data = response.data;

        if (data.customers) {
          const totalCustomers = data.customers.length;
          const blacklisted = data.customers.filter((c: any) => c.status === 'Blacklisted').length;
          const active = data.customers.filter((c: any) => c.status === 'Active').length;

          setStats(prev => ({
            ...prev,
            customers: { total: totalCustomers, blacklisted, active }
          }));

          // Generate customer chart data based on real data
          generateCustomerChartData(data.customers);
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch contract data
  const fetchContracts = async () => {
    try {
      const response = await getRequest('/api/contracts?limit=-1');
      if (response.success && response.data) {
        const data = response.data;

        if (data.contracts) {
          const totalContracts = data.contracts.length;
          const open = data.contracts.filter((c: any) => c.status?.name === 'Active').length;
          const closed = data.contracts.filter((c: any) => c.status?.name === 'Completed').length;

          setStats(prev => ({
            ...prev,
            contracts: { total: totalContracts, open, closed }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  // Generate customer chart data based on real customer data
  const generateCustomerChartData = (customers: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Group customers by creation month-year
    const customersByMonthYear: Record<string, number> = {};

    customers.forEach(customer => {
      if (customer.created_at) {
        const date = new Date(customer.created_at);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        if (monthIndex >= 0 && monthIndex < months.length) {
          const month = months[monthIndex];
          const monthYear = `${month}-${year}`;
          customersByMonthYear[monthYear] = (customersByMonthYear[monthYear] || 0) + 1;
        }
      }
    });

    // Create chart data sorted by date
    const chartData = Object.entries(customersByMonthYear)
      .map(([monthYear, count]) => ({
        month: monthYear,
        customers: count
      }))
      .sort((a, b) => {
        // Sort by year and month
        const [monthA, yearA] = a.month.split('-');
        const [monthB, yearB] = b.month.split('-');
        const monthIndexA = months.indexOf(monthA);
        const monthIndexB = months.indexOf(monthB);

        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB);
        }
        return monthIndexA - monthIndexB;
      });

    setCustomerData(chartData);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchVehicles(),
        fetchCustomers(),
        fetchContracts()
      ]);

      // Set placeholder finance and inspection data
      setStats(prev => ({
        ...prev,
        finances: {
          revenue: 12450.00,
          expenses: 10000.00,
          netProfit: 2450.00,
          outstandingInvoices: 12
        },
        inspections: {
          total: 120,
          completed: 108,
          withDamages: 54
        }
      }));

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const totalVehicles = vehicleStatuses.reduce((sum, status) => sum + status.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Inventory Chart */}
        <CustomCard shadow="md" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Inventory</h3>
          </div>
          <div className="flex items-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatuses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {vehicleStatuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 ml-6">
              <div className="space-y-2">
                {vehicleStatuses.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-600">{status.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CustomCard>

        {/* Active Customers Chart */}
        <CustomCard shadow="md" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Customers</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, 'dataMax']}
                  tickCount={6}
                  allowDecimals={false}
                />
                <defs>
                  <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#005F8E" />
                    <stop offset="100%" stopColor="#00A8AB" />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="customers"
                  fill="url(#customerGradient)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CustomCard>
      </div>

      {/* Bottom Row - Stats Cards */}
      <div className="space-y-8">
        {/* Vehicles Section */}
        <div className="space-y-4">
          <Link href="/vehicles" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
            <ArrowRight className="w-5 h-5 text-primary" />
          </Link>
          <SummaryCard data={[
            { label: 'Vehicles', value: stats.vehicles.total, icon: <Car className="w-6 h-6 text-primary" /> },
            { label: 'Reserved', value: stats.vehicles.reserved, icon: <Calendar className="w-6 h-6 text-primary" /> },
            { label: 'Available', value: stats.vehicles.available, icon: <FileText className="w-6 h-6 text-primary" /> },
            { label: 'Oil change', value: stats.vehicles.oilChange, icon: <Wrench className="w-6 h-6 text-primary" /> }
          ]} />
        </div>

        {/* Customers Section */}
        <div className="space-y-4">
          <Link href="/customers" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
            <ArrowRight className="w-5 h-5 text-primary" />
          </Link>
          <SummaryCard data={[
            { label: 'Customers', value: stats.customers.total, icon: <Users className="w-6 h-6 text-primary" /> },
            { label: 'Blacklisted', value: stats.customers.blacklisted, icon: <AlertCircle className="w-6 h-6 text-primary" /> },
            { label: 'Active', value: stats.customers.active, icon: <CheckCircle className="w-6 h-6 text-primary" /> }
          ]} />
        </div>

        {/* Contracts Section */}
        <div className="space-y-4">
          <Link href="/contracts" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold text-gray-900">Contracts</h3>
            <ArrowRight className="w-5 h-5 text-primary" />
          </Link>
          <SummaryCard data={[
            { label: 'Contracts', value: stats.contracts.total, icon: <FileText className="w-6 h-6 text-primary" /> },
            { label: 'Open', value: stats.contracts.open, icon: <div className="w-6 h-6 text-primary flex items-center justify-center"><div className="w-4 h-4 border-2 border-primary rounded"></div></div> },
            { label: 'Closed', value: stats.contracts.closed, icon: <CheckCircle className="w-6 h-6 text-primary" /> }
          ]} />
        </div>

        {/* Finances Section */}
        <div className="space-y-4">
          <Link href="/finance" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold text-gray-900">Finances</h3>
            <ArrowRight className="w-5 h-5 text-primary" />
          </Link>
          <SummaryCard data={[
            { label: 'Revenue', value: `SAR ${stats.finances.revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-primary" /> },
            { label: 'Expenses', value: `SAR ${stats.finances.expenses.toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-primary" /> },
            { label: 'Net Profit', value: `SAR ${stats.finances.netProfit.toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-primary" /> },
            { label: 'Outstanding invoices', value: stats.finances.outstandingInvoices, icon: <FileText className="w-6 h-6 text-primary" /> }
          ]} />
        </div>

        {/* Inspections Section */}
        <div className="space-y-4">
          <Link href="/inspections" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold text-gray-900">Inspections</h3>
            <ArrowRight className="w-5 h-5 text-primary" />
          </Link>
          <SummaryCard data={[
            { label: 'Inspections', value: stats.inspections.total, icon: <Clipboard className="w-6 h-6 text-primary" /> },
            { label: 'Completed', value: stats.inspections.completed, icon: <CheckCircle className="w-6 h-6 text-primary" /> },
            { label: 'With Damages', value: stats.inspections.withDamages, icon: <Wrench className="w-6 h-6 text-primary" /> }
          ]} />
        </div>
      </div>
    </div>
  );
}
