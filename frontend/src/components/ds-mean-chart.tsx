import React, { FC, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

export interface SessionsResponse {
  data: {
    id_ks: string;
    ds_mean: number;
    ks_mean: number;
  }[];
}

const SessionsChart: FC<SessionsResponse> = ({ data }) => {
  // Постоянное значение ds_mean (одинаковое для всех записей)
  const dsAverage = data[0].ds_mean;

  // Вычислим максимальное значение ks_mean для установки масштаба Y
  const maxKsValue = Math.max(...data.map((item) => item.ks_mean));

  // Вычислим форматированные метки для оси X, чтобы сделать их короче
  const formatXLabel = (id: string) => {
    return id.substring(id.length - 4);
  };

  const avgReduction = useMemo(() => {
    // Для каждой записи вычисляем разницу
    const reductions = data.map((item) => {
      // Если ds_mean больше ks_mean, это снижение
      if (item.ds_mean > item.ks_mean) {
        return item.ds_mean - item.ks_mean;
      }
      // Если ks_mean больше ds_mean, считаем как 0 (нет снижения)
      return 0;
    });

    // Считаем среднее снижение
    const sum = reductions.reduce((acc, val) => acc + val, 0);
    return sum / reductions.length;
  }, [data]);

  return (
    <div className="w-full h-full">
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="id_ks"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
              tickFormatter={formatXLabel}
              label={{
                value: "ID сессии (последние 4 цифры)",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{ value: "Значение", angle: -90, position: "insideLeft" }}
              domain={[0, Math.ceil(maxKsValue * 1.1)]}
            />
            <Tooltip
              formatter={(value) => [Number(value).toFixed(4), ""]}
              labelFormatter={(id) => `ID сессии: ${id}`}
            />
            <Legend verticalAlign="top" height={36} />
            <ReferenceLine
              y={dsAverage}
              label={{
                value: `ds_mean: ${dsAverage.toFixed(2)}`,
                position: "top",
                fill: "#ff7300",
              }}
              stroke="#ff7300"
              strokeDasharray="3 3"
            />
            <Bar dataKey="ks_mean" fill="#4f46e5" name="ks_mean" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Блок со средним снижением */}
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Статистика снижения
        </h3>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
          <div>
            <p className="text-blue-900 font-medium">
              Среднее снижение:
              <span className="ml-2 text-xl font-bold">
                {avgReduction.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-blue-600">
              Среднее отклонение от общего среднего (ds_mean), когда значение
              ks_mean ниже ds_mean
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsChart;
