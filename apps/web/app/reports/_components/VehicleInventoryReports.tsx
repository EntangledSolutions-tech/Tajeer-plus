'use client';

import { useState, useEffect } from 'react';
import { Printer, Car, Clock, Wrench, CheckCircle } from 'lucide-react';
import SummaryCard from '../../reusableComponents/SummaryCard';
import CustomCard from '../../reusableComponents/CustomCard';
import CustomButton from '../../reusableComponents/CustomButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from '@kit/ui/sonner';
import { useHttpService } from '../../../lib/http-service';

interface VehicleData {
  [key: string]: number; // Dynamic status counts
  total: number;
}

interface VehicleTypeData {
  name: string;
  quantity: number;
}

interface VehicleStatus {
  id: string;
  name: string;
  color: string | null;
}

export default function VehicleInventoryReports() {
  const { getRequest } = useHttpService();
  const [loading, setLoading] = useState({
    inventory: true,
    vehicleTypes: true,
    statuses: true
  });
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    total: 0
  });
  const [vehicleTypeData, setVehicleTypeData] = useState<VehicleTypeData[]>([]);
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [allStatusCounts, setAllStatusCounts] = useState<{ status: string; count: number; color: string }[]>([]);
  const [statusForPie, setStatusForPie] = useState<{ status: string; count: number; color: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle inventory data from API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(prev => ({ ...prev, inventory: true, vehicleTypes: true, statuses: true }));
        setError(null);

        // Fetch all vehicles from the existing API
        const response = await getRequest('/api/vehicles?limit=-1'); // Get all vehicles

        if (response.success && response.data) {
          const result = response.data;
          console.log('Received vehicles:', result.vehicles);

          // Process vehicles data to create reports
          const vehicles = result.vehicles;

          // Calculate inventory stats by status (dynamic)
          const inventoryStats: { [key: string]: number } = {
            total: vehicles.length
          };

          // Calculate vehicle type stats by make (company)
          const vehicleTypeStats: { name: string; quantity: number }[] = [];
          const makeCounts: { [key: string]: number } = {};

          // Get unique vehicle statuses
          const vehicleStatuses: { id: string; name: string; color: string | null }[] = [];
          const statusMap: { [key: string]: { id: string; name: string; color: string | null } } = {};
          const statusCounts: { [key: string]: number } = {}; // For summary cards only
          const allStatusCountsTemp: { [key: string]: number } = {}; // Temporary object for counting
          const statusForPieTemp: { [key: string]: { status: string; count: number; color: string } } = {}; // For pie chart

          vehicles.forEach((vehicle: any) => {
            // Count by status (only predefined summary labels for summary cards)
            const statusName = vehicle.status?.name || 'Unknown';

            // Collect status for pie chart with color
            if (vehicle.status && !statusForPieTemp[statusName]) {
              statusForPieTemp[statusName] = {
                status: statusName,
                count: 0,
                color: vehicle.status.color || '#6b7280'
              };
            }

            // Increment count for this status
            if (statusForPieTemp[statusName]) {
              statusForPieTemp[statusName].count++;
            }

            // Count for summary cards (only predefined labels)
            const predefinedLabels = ['Available', 'Reserved', 'Out for Service', 'Sold'];
            if (predefinedLabels.includes(statusName)) {
              statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
            }

            // Count for pie chart (ALL statuses)
            allStatusCountsTemp[statusName] = (allStatusCountsTemp[statusName] || 0) + 1;

            // Count by make (company)
            const makeName = vehicle.make?.name || 'Unknown';
            makeCounts[makeName] = (makeCounts[makeName] || 0) + 1;

            // Collect unique statuses (for pie chart - all statuses)
            if (vehicle.status && !statusMap[vehicle.status.id]) {
              console.log('Processing vehicle status:', vehicle.status);
              statusMap[vehicle.status.id] = {
                id: vehicle.status.id,
                name: vehicle.status.name,
                color: vehicle.status.color
              };
            }
          });

          // Convert status counts to inventory stats
          Object.entries(statusCounts).forEach(([statusName, count]) => {
            inventoryStats[statusName] = count;
          });

          // Ensure total is set
          inventoryStats.total = vehicles.length;

          // Convert make counts to array format
          Object.entries(makeCounts).forEach(([name, quantity]) => {
            vehicleTypeStats.push({ name, quantity });
          });

          // Convert status map to array
          Object.values(statusMap).forEach(status => {
            vehicleStatuses.push(status);
          });

          console.log('StatusMap:', statusMap);
          console.log('VehicleStatuses:', vehicleStatuses);
          console.log('AllStatusCountsTemp:', allStatusCountsTemp);

          // Convert allStatusCountsTemp to array format with colors
          const allStatusCountsArray = Object.entries(allStatusCountsTemp).map(([statusName, count]) => {
            // Find the status by looking through the statusMap values
            const status = vehicleStatuses.find(s => s.name === statusName);
            console.log(`Status: ${statusName}, Found status:`, status, 'Color:', status?.color);

            // Use only the color from the backend, fallback to default gray if null/undefined
            const color = status?.color || '#6b7280';

            return {
              status: statusName,
              count: count,
              color: color
            };
          });

          // Convert statusForPieTemp to array
          const statusForPieArray = Object.values(statusForPieTemp);

          console.log('Processed data:', { inventoryStats, vehicleTypeStats, vehicleStatuses, allStatusCountsArray, statusForPieArray });

          // Update state
          setVehicleData(inventoryStats as VehicleData);
          setVehicleTypeData(vehicleTypeStats);
          setVehicleStatuses(vehicleStatuses);
          setAllStatusCounts(allStatusCountsArray);
          setStatusForPie(statusForPieArray);
        }
      } catch (err: any) {
        console.error('Error fetching inventory data:', err);
        setError(err.message || 'Failed to fetch inventory data');
        toast.error('Error fetching inventory data: ' + (err?.message || 'Unknown error'));
      } finally {
        setLoading({ inventory: false, vehicleTypes: false, statuses: false });
      }
    };

    fetchInventoryData();
  }, []);

  // Create static summary cards with predefined labels
  const summaryData = [
    { label: 'Available', value: vehicleData['Available'] || 0, icon: <Car className="w-6 h-6" /> },
    { label: 'Reserved', value: vehicleData['Reserved'] || 0, icon: <Clock className="w-6 h-6" /> },
    { label: 'Out for Service', value: vehicleData['Out for Service'] || 0, icon: <Wrench className="w-6 h-6" /> },
    { label: 'Sold', value: vehicleData['Sold'] || 0, icon: <CheckCircle className="w-6 h-6" /> }
  ];


  // Prepare data for Bar Chart (following SimpleBarChart example)
  const barChartData = vehicleTypeData.map(item => ({
    name: String(item.name),
    quantity: Number(item.quantity) || 0
  }));

  // Prepare data for Pie Chart with dynamic statuses
  const pieChartData = statusForPie.map(statusData => ({
    name: statusData.status,
    value: statusData.count,
    fill: statusData.color
  })).filter(item => item.value > 0); // Only show segments with values

  // Debug logging
  console.log('Pie chart data:', pieChartData);
  console.log('Vehicle statuses:', vehicleStatuses);
  console.log('Vehicle data:', vehicleData);
  console.log('All status counts:', allStatusCounts);
  console.log('Status for pie:', statusForPie);

  // Custom label function for pie chart (from Recharts example)
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Show loading state
  if (loading.inventory || loading.vehicleTypes || loading.statuses) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <CustomCard shadow="sm" radius="xl" padding="lg">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">Error Loading Reports</div>
            <div className="text-gray-600">{error}</div>
            <CustomButton
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </CustomButton>
          </div>
        </CustomCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <SummaryCard data={summaryData} />

      {/* Per vehicle type section - Bar Chart */}
      <CustomCard shadow="sm" radius="xl" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Per vehicle type</h3>
          <CustomButton isSecondary size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </CustomButton>
        </div>

        {barChartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}
                />
                 <defs>
                  <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#005F8E" />
                    <stop offset="100%" stopColor="#00A8AB" />
                  </linearGradient>
                </defs>
                <Bar dataKey="quantity" fill="url(#customGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No vehicle data available
          </div>
        )}
      </CustomCard>

      {/* Vehicle Inventory section - Pie Chart */}
      <CustomCard shadow="sm" radius="xl" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Vehicle Inventory by Status</h3>
        </div>

        <div className="h-[500px]">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No status data available
            </div>
          )}
        </div>
      </CustomCard>
    </div>
  );
}
