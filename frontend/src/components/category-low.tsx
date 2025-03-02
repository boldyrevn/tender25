import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

// Define TypeScript interfaces for our data
export interface CategoryLowData {
  category_name: string;
  demand_factor: number;
}

// Interface for custom tooltip props
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const DemandLowCoverageChart: React.FC<{ data: CategoryLowData[] }> = ({
  data,
}) => {
  // Custom function to truncate long category names
  const truncateText = (text: string, maxLength = 25): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold">{payload[0]?.payload.category_name}</p>
          <p className="text-gray-700">{`Коэффициент спроса: ${payload[0]?.value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom YAxis tick component
  interface TickProps {
    x: number;
    y: number;
    payload: {
      value: string;
    };
  }

  const CustomYAxisTick: React.FC<TickProps> = (props) => {
    const { x, y, payload } = props;
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize={12}>
        {truncateText(payload.value)}
      </text>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, "dataMax + 5"]} />
          <YAxis
            type="category"
            width={250}
            dataKey="category_name"
            tick={(x) => <CustomYAxisTick {...x} />}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="demand_factor"
            name="Коэффициент спроса"
            fill="#E91E63"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemandLowCoverageChart;
