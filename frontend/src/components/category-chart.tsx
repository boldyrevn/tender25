import { observer } from "mobx-react-lite";
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
export interface CategoryItem {
  category_name: string;
  value_type: string;
  value: number;
}

export interface CategoryData {
  highest_demand: CategoryItem[];
  highest_concurrency: CategoryItem[];
  highest_wins: CategoryItem[];
}

// Interface for custom tooltip props
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CategoryCharts: React.FC<{ data: CategoryData }> = observer(
  ({ data }) => {
    // Custom function to truncate long category names
    const truncateText = (text: string, maxLength = 25): string => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + "...";
    };

    // Custom tooltip component
    const CustomTooltip: React.FC<CustomTooltipProps> = ({
      active,
      payload,
      label,
    }) => {
      if (active && payload?.length) {
        return (
          <div className="bg-white p-4 border border-gray-200 rounded-md">
            <p className="font-bold">{payload[0]?.payload.category_name}</p>
            <p className="text-gray-700">{`${payload[0]?.payload.value_type}: ${payload[0]?.value}`}</p>
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
      <div className="grid grid-cols-1 gap-8">
        {/* Chart 1: Highest Wins */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Категории с наибольшими выигрышами
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.highest_wins}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  width={250}
                  dataKey="category_name"
                  tick={(x) => <CustomYAxisTick {...x} />}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Количество выигранных сессий"
                  fill="#4CAF50"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Highest Concurrency */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Категории с наибольшим соперничеством
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.highest_concurrency}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  width={250}
                  dataKey="category_name"
                  tick={(x) => <CustomYAxisTick {...x} />}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Количество соперников"
                  fill="#2196F3"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Highest Demand */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Категории с наибольшим спросом
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.highest_demand}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  width={250}
                  dataKey="category_name"
                  tick={(x) => <CustomYAxisTick {...x} />}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Коэффициент спроса" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  },
);

export default CategoryCharts;
