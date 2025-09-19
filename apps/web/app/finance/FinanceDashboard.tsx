import { Button } from '@kit/ui/button';
import { ArrowRight, DollarSign, TrendingUp, Receipt, Building2, Users, Car, Calculator, FileText } from 'lucide-react';
import Link from 'next/link';
import CustomCard from '../reusableComponents/CustomCard';

export default function FinanceDashboard() {
  // Summary cards data
  const summaryCards = [
    {
      title: 'Revenue',
      value: 'SAR 12,450.00',
      icon: <DollarSign className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Expenses',
      value: 'SAR 10,000.00',
      icon: <TrendingUp className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Net Profit',
      value: 'SAR 2,450.00',
      icon: <DollarSign className="w-6 h-6 text-gray-600" />
    },
    {
      title: 'Outstanding invoices',
      value: '12',
      icon: <Receipt className="w-6 h-6 text-gray-600" />
    }
  ];

  // Finance section cards
  const financeSections = [
    {
      title: 'Rental Company Finances',
      subtitle: '2 Invoices outstanding',
      icon: <Building2 className="w-6 h-6 text-primary" />,
      href: '/finance/rental-finances'
    },
    {
      title: 'Customer Finances',
      subtitle: '2 Invoices outstanding',
      icon: <Users className="w-6 h-6 text-primary" />,
      href: '/finance/customer-finances'
    },
    {
      title: 'Vehicle Finances',
      subtitle: '2 Invoices outstanding',
      icon: <Car className="w-6 h-6 text-primary" />,
      href: '/finance/vehicle-finances'
    }
  ];

  // Additional finance sections
  const additionalSections = [
    {
      title: 'Zakat Calculation',
      subtitle: 'Calculate and manage Zakat payments',
      icon: <Calculator className="w-6 h-6 text-primary" />,
      href: '/finance/zakat'
    },
    {
      title: 'VAT Management',
      subtitle: 'Manage VAT calculations and reporting',
      icon: <FileText className="w-6 h-6 text-primary" />,
      href: '/finance/vat'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="text-white/80 mt-2">
            Manage your financial operations and reporting
          </p>
        </div>
        <Button variant="outline" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5">
          <span>Generate Report</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <CustomCard key={index} className="bg-white" padding="default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-primary">
                  {card.icon}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-800">
                  {card.value}
                </div>
                <div className="text-sm text-primary font-medium">
                  {card.title}
                </div>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Finance Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {financeSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <CustomCard className="group hover:shadow-lg transition-all duration-200 border-primary/30 hover:border-primary/50 cursor-pointer bg-white" padding="default">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CustomCard>
          </Link>
        ))}
      </div>

      {/* Additional Finance Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <CustomCard className="group hover:shadow-lg transition-all duration-200 border-primary/30 hover:border-primary/50 cursor-pointer bg-white" padding="default">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CustomCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
