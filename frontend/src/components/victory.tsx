import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

// Define the type for our props
export interface VictoryStatProps {
  victory_stat_base: {
    name?: string;
    offer_cnt: number;
    supplier_cnt: number;
  }[];
}

// Генерация случайных данных для примера (в реальном внедрении будут использоваться props)
const generateSampleData = () => {
  return [
    { name: "Министерство обороны", offer_cnt: 47, supplier_cnt: 12 },
    { name: "Министерство образования", offer_cnt: 35, supplier_cnt: 8 },
    { name: "Министерство здравоохранения", offer_cnt: 28, supplier_cnt: 10 },
    { name: "Областная администрация", offer_cnt: 42, supplier_cnt: 15 },
    { name: "Городской муниципалитет", offer_cnt: 32, supplier_cnt: 9 },
  ];
};

// Custom active shape for pie chart
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-20}
        textAnchor="middle"
        fill={fill}
        className="text-lg font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={10}
        textAnchor="middle"
        fill="#999"
        className="text-sm"
      >
        {`${value} тендеров (${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// Настраиваемая всплывающая подсказка для столбчатой диаграммы
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 rounded-md shadow-md border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-blue-600">{`Выигранные тендеры: ${payload[0].value}`}</p>
        <p className="text-green-600">{`Уникальные поставщики: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const VictoryStatsVisualization: React.FC<VictoryStatProps> = ({
  victory_stat_base,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartType, setChartType] = useState("bar");

  // В реальном внедрении мы будем использовать props
  // Здесь используем пример данных для демонстрации
  const data = useMemo(() => {
    if (
      victory_stat_base &&
      victory_stat_base.length > 0 &&
      (victory_stat_base[0].offer_cnt > 0 ||
        victory_stat_base[0].supplier_cnt > 0)
    ) {
      // Добавляем имена для данных, если их нет
      return victory_stat_base.map((item, index) => ({
        name: item.name || `Заказчик ${index + 1}`,
        offer_cnt: item.offer_cnt,
        supplier_cnt: item.supplier_cnt,
      }));
    }
    return generateSampleData();
  }, [victory_stat_base]);

  // Calculate totals for summary
  const totalTenders = data.reduce((sum, item) => sum + item.offer_cnt, 0);
  const totalSuppliers = data.reduce((sum, item) => sum + item.supplier_cnt, 0);

  // Prepare data for pie chart
  const pieData = data.map((item) => ({
    name: item.name,
    value: item.offer_cnt,
  }));

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-600">Всего выигранных тендеров</p>
          <p className="text-3xl font-bold text-blue-800">{totalTenders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-green-600">Всего уникальных поставщиков</p>
          <p className="text-3xl font-bold text-green-800">{totalSuppliers}</p>
        </div>
      </div>

      <Tabs defaultValue="bar" className="w-full" onValueChange={setChartType}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="bar">Столбчатая диаграмма</TabsTrigger>
          <TabsTrigger value="pie">Круговая диаграмма</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="mt-0">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="offer_cnt"
                  name="Выигранные тендеры"
                  fill="#0088FE"
                />
                <Bar
                  dataKey="supplier_cnt"
                  name="Уникальные поставщики"
                  fill="#00C49F"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="pie" className="mt-0">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {data.length === 0 && (
        <div className="flex items-center justify-center p-6 bg-amber-50 rounded-lg">
          <AlertCircle className="mr-2 text-amber-500" />
          <p className="text-amber-700">Данные статистики побед отсутствуют</p>
        </div>
      )}
    </>
  );
};

export default VictoryStatsVisualization;
