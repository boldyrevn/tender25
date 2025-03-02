import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

// TypeScript interfaces
interface WonData {
  Год: string;
  Месяц?: string;
  "Количество выигранных КС": number;
}

interface LoseData {
  Год: string;
  Месяц?: string;
  "Количество проигранных КС": number;
}

interface WonPercData {
  Год: string;
  Месяц?: string;
  "Процент выигранных КС": string;
}

export interface StatsData {
  won: WonData[];
  lose: LoseData[];
  won_perc: WonPercData[];
}

interface MergedDataItem {
  period: string;
  won: number;
  lose: number;
  percentage: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface StatsChartProps {
  data: StatsData;
}

const StatsChart: React.FC<StatsChartProps> = observer(({ data }) => {
  const [chartType, setChartType] = useState<"monthly" | "yearly" | "">("");
  const [mergedData, setMergedData] = useState<MergedDataItem[]>([]);

  useEffect(() => {
    // Determine chart type based on data structure
    if (
      data.won?.[0] &&
      Object.prototype.hasOwnProperty.call(data.won[0], "Месяц")
    ) {
      setChartType("monthly");
    } else {
      setChartType("yearly");
    }

    // Process and merge the data
    if (data.won && data.lose && data.won_perc) {
      if (
        data.won[0] &&
        Object.prototype.hasOwnProperty.call(data.won[0], "Месяц")
      ) {
        // Process monthly data
        const processed: MergedDataItem[] = [];

        data.won.forEach((wonItem) => {
          const period = `${wonItem["Год"]}-${wonItem["Месяц"]}`;

          // Find corresponding lose and percentage data
          const loseItem = data.lose.find(
            (item) =>
              item["Год"] === wonItem["Год"] &&
              item["Месяц"] === wonItem["Месяц"],
          );

          const percItem = data.won_perc.find(
            (item) =>
              item["Год"] === wonItem["Год"] &&
              item["Месяц"] === wonItem["Месяц"],
          );

          processed.push({
            period,
            won: wonItem["Количество выигранных КС"],
            lose: loseItem ? loseItem["Количество проигранных КС"] : 0,
            percentage: percItem
              ? parseFloat(percItem["Процент выигранных КС"])
              : 0,
          });
        });

        setMergedData(processed);
      } else {
        // Process yearly data
        const processed: MergedDataItem[] = [];

        data.won.forEach((wonItem) => {
          const year = wonItem["Год"];

          // Find corresponding lose and percentage data
          const loseItem = data.lose.find((item) => item["Год"] === year);
          const percItem = data.won_perc.find((item) => item["Год"] === year);

          processed.push({
            period: year,
            won: wonItem["Количество выигранных КС"],
            lose: loseItem ? loseItem["Количество проигранных КС"] : 0,
            percentage: percItem
              ? parseFloat(percItem["Процент выигранных КС"])
              : 0,
          });
        });

        setMergedData(processed);
      }
    }
  }, [data]);

  // Custom tooltip component
  const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded">
          <p className="text-gray-700 font-medium">{`Период: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name === "won" && `Выиграно: ${entry.value}`}
              {entry.name === "lose" && `Проиграно: ${entry.value}`}
              {entry.name === "percentage" && `Процент побед: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render the appropriate chart based on the detected type
  const renderChart = () => {
    if (chartType === "monthly") {
      return (
        <div className="w-full">
          <h2 className="text-xl font-bold mb-6 text-center">
            Статистика КС по месяцам
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={mergedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="won"
                name="Выиграно"
                fill="#4CAF50"
                barSize={20}
              />
              <Bar
                yAxisId="left"
                dataKey="lose"
                name="Проиграно"
                fill="#F44336"
                barSize={20}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                name="Процент побед"
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartType === "yearly") {
      return (
        <div className="w-full">
          <h2 className="text-xl font-bold mb-6 text-center">
            Годовая статистика КС
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={mergedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="won"
                name="Выиграно"
                fill="#4CAF50"
                barSize={40}
              />
              <Bar
                yAxisId="left"
                dataKey="lose"
                name="Проиграно"
                fill="#F44336"
                barSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                name="Процент побед"
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return <div>Нет данных</div>;
  };

  return (
    <div className="w-full">
      {mergedData.length > 0 ? (
        renderChart()
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Нет данных</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>* КС = Конкурсная Система</p>
      </div>
    </div>
  );
});

export default StatsChart;
