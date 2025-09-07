import { Button } from '@kit/ui/button';
import { ArrowRight, Car, Users, FileText, Shield, Building2, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import CustomCard from '../reusableComponents/CustomCard';

export default function ConfigurationsList() {
  const configurationCategories = [
    {
      title: 'Vehicle Configurations',
      icon: <Car className="w-6 h-6 text-primary" />,
      href: '/configurations/vehicles',
      description: 'Configure vehicle types, categories, and settings'
    },
    {
      title: 'Customer Configurations',
      icon: <Users className="w-6 h-6 text-primary" />,
      href: '/configurations/customers',
      description: 'Configure customer types, validation rules, and settings'
    },
    {
      title: 'Contract Configurations',
      icon: <FileText className="w-6 h-6 text-primary" />,
      href: '/configurations/contracts',
      description: 'Configure contract templates, terms, and conditions'
    },
    {
      title: 'Insurance Configurations',
      icon: <Shield className="w-6 h-6 text-primary" />,
      href: '/configurations/insurance',
      description: 'Configure insurance providers, coverage options, and rates'
    },
    {
      title: 'Rental Company Configurations',
      icon: <Building2 className="w-6 h-6 text-primary" />,
      href: '/configurations/rental-company',
      description: 'Configure company settings, branches, and policies'
    },
    {
      title: 'System Configurations',
      icon: <Settings className="w-6 h-6 text-primary" />,
      href: '/configurations/system',
      description: 'Configure system settings, integrations, and preferences',
      disabled: true,
      disabledReason: 'System configurations are currently under maintenance'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Title and Manage Integrations Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurations</h1>
          <p className="text-white/80 mt-2">
            Manage and configure various aspects of your rental system
          </p>
        </div>
        <Button variant="outline" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5">
          <span>Manage Integrations</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Configuration Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configurationCategories.map((category, index) => {
          const cardContent = (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          );

          if (category.disabled) {
            return (
              <CustomCard
                key={index}
                disabled={true}
                disabledReason={category.disabledReason}
                className="group hover:shadow-lg transition-all duration-200 border-primary/30 hover:border-primary/50 cursor-pointer bg-white"
                padding="default"
              >
                {cardContent}
              </CustomCard>
            );
          }

          return (
            <Link key={index} href={category.href}>
              <CustomCard className="group hover:shadow-lg transition-all duration-200 border-primary/30 hover:border-primary/50 cursor-pointer bg-white" padding="default">
                {cardContent}
              </CustomCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
