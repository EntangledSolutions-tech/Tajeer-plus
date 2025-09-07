import React from 'react';
import CustomCard from './CustomCard';

interface SummaryCardData {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface SummaryCardProps {
  data: SummaryCardData[];
}

interface SingleSummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function SummaryCard({ data }: SummaryCardProps) {
  // Dynamic grid columns based on number of items
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'md:grid-cols-2';
    if (count === 3) return 'md:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'md:grid-cols-2 lg:grid-cols-4';
    return 'md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
  };

  return (
    <div className={`grid ${getGridCols(data.length)} gap-6 mb-8`}>
      {data.map((item, index) => (
        <CustomCard
          key={index}
          shadow="sm"
          elevation="default"
          hover={false}
          radius="xl"
          border="default"
          background="default"
          padding="default"
        >
          {/* Icon on the left side */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="text-primary">
                {item.icon}
              </div>
            </div>

            {/* Value and label on the right side */}
            <div className="flex flex-col">
              {/* Value - Large, bold, dark gray */}
              <div className="text-2xl font-bold text-gray-800">
                {item.value}
              </div>

              {/* Label - Smaller, primary color */}
              <div className="text-sm text-primary font-medium">
                {item.label}
              </div>
            </div>
          </div>
        </CustomCard>
      ))}
    </div>
  );
}

export function SingleSummaryCard({ label, value, icon }: SingleSummaryCardProps) {
  return (
    <CustomCard
      shadow="sm"
      elevation="default"
      hover={false}
      radius="xl"
      border="default"
      background="default"
      padding="default"
    >
      {/* Icon on the left side */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="text-primary">
            {icon}
          </div>
        </div>

        {/* Value and label on the right side */}
        <div className="flex flex-col">
          {/* Value - Large, bold, dark gray */}
          <div className="text-2xl font-bold text-gray-800">
            {value}
          </div>

          {/* Label - Smaller, primary color */}
          <div className="text-sm text-primary font-medium">
            {label}
          </div>
        </div>
      </div>
    </CustomCard>
  );
}

export default SummaryCard;