import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, X, Percent } from "lucide-react";
import { ParticipationResponse } from "@/api/endpoints/participation.endpoint";

// Компонент для отображения метрик
export const ParticipationSimple = ({
  won,
  lose,
  won_perc,
}: ParticipationResponse) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* Победы */}
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
            <Trophy size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Победы</p>
          <p className="text-2xl font-bold text-green-600">{won}</p>
        </div>

        {/* Поражения */}
        <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
            <X size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Поражения</p>
          <p className="text-2xl font-bold text-red-600">{lose}</p>
        </div>

        {/* Процент побед */}
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
            <Percent size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">% побед</p>
          <p className="text-2xl font-bold text-blue-600">{won_perc}%</p>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mt-6">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">Соотношение</span>
          <span className="text-xs font-medium text-gray-500">{won_perc}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${won_perc}%` }}
          ></div>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Всего</p>
          <p className="text-2xl font-bold text-gray-700">{won + lose}</p>
        </div>
      </div>
    </>
  );
};
