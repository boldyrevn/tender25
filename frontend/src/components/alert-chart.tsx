import React, { useState, useEffect, FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface PriceDifferenceData {
  diff: {
    id_ks: string;
    amt: number;
  }[];
  amt: number;
}

const PriceDifferenceChart: FC<{ data: PriceDifferenceData }> = ({ data }) => {
  // Рассчитываем процентные различия относительно общей суммы
  const obshee = data.diff.reduce((acc, v) => acc + v.amt, 0);
  const chartData = data.diff.map((item) => {
    const percentage = ((item.amt / obshee) * 100).toFixed(2);
    return {
      id: item.id_ks,
      percentage: parseFloat(percentage),
      amt: item.amt,
    };
  });

  // Сортируем данные для лучшей визуализации
  chartData.sort((a, b) => a.percentage - b.percentage);

  // Форматирование больших чисел
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + " млн";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + " тыс";
    }
    return num.toFixed(2);
  };

  // Пользовательский tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">ID: {payload[0].payload.id}</p>
          <p className="text-blue-600">
            Значение: {formatNumber(payload[0].payload.amt)} руб.
          </p>
          <p className="text-green-600">Процент: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis
            dataKey="id"
            label={{
              value: "ID контракта",
              position: "insideBottom",
              offset: 5,
            }}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            label={{
              value: "Процент от общей суммы (%)",
              angle: -90,
              position: "insideLeft",
              dy: 100,
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={(x) => <CustomTooltip {...x} />} />
          <Legend wrapperStyle={{ position: "relative", marginTop: "10px" }} />
          <Bar
            dataKey="percentage"
            fill="#3b82f6"
            name="Процент от общей суммы"
          />
        </BarChart>
      </ResponsiveContainer>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle className="text-xl font-bold text-blue-800">
          За период
        </AlertTitle>
        <AlertDescription className="text-3xl font-bold text-blue-600">
          {formatNumber(data.amt)} руб.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PriceDifferenceChart;
