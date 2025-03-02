import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

// Типы для периодичности
export type RecurrenceType = "daily" | "weekly" | "monthly";

// Интерфейс для пропсов компонента (controlled)
interface RecurrenceIntervalSelectorProps {
  // Значения состояния
  startDate: Date;
  endDate: Date;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;

  // Обработчики изменений
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  onRecurrenceIntervalChange: (interval: number) => void;

  // Опциональный заголовок карточки
  title?: string;
}

// Вспомогательная функция для правильного склонения слов в русском языке
const pluralize = (
  count: number,
  [one, few, many]: [string, string, string],
): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return few;
  }
  return many;
};

const RecurrenceIntervalSelector: React.FC<RecurrenceIntervalSelectorProps> = (
  x,
) => {
  // Таблица для склонения
  const recurrenceLabels: Record<RecurrenceType, [string, string, string]> = {
    daily: ["день", "дня", "дней"],
    weekly: ["неделю", "недели", "недель"],
    monthly: ["месяц", "месяца", "месяцев"],
  };

  // Состояние для ошибок валидации
  const [errors, setErrors] = React.useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // Обработчик изменения даты начала
  const handleStartDateChange = (date: Date | undefined): void => {
    if (!date) return;
    x.onStartDateChange(date);

    // Если дата окончания раньше новой даты начала, обновляем дату окончания
    if (x.endDate < date) {
      x.onEndDateChange(addDays(date, 1));
    }
  };

  // Валидация дат
  React.useEffect(() => {
    const newErrors: any = {};

    if (!isValid(x.startDate)) {
      newErrors.startDate = "Неверная дата начала";
    }

    if (!isValid(x.endDate)) {
      newErrors.endDate = "Неверная дата окончания";
    }

    if (isValid(x.startDate) && isValid(x.endDate) && x.endDate < x.startDate) {
      newErrors.endDate = "Дата окончания должна быть позже даты начала";
    }

    setErrors(newErrors);
  }, [x.startDate, x.endDate]);

  // Получение текста периодичности
  const getRecurrenceText = (): string => {
    const { recurrenceType, recurrenceInterval, startDate, endDate } = x;
    let text = "";

    if (recurrenceInterval === 1) {
      // Простой случай - каждый день/неделю/месяц
      switch (recurrenceType) {
        case "daily":
          text = "Каждый день";
          break;
        case "weekly":
          text = "Каждую неделю";
          break;
        case "monthly":
          text = "Каждый месяц";
          break;
      }
    } else {
      // Сложный случай - каждые N дней/недель/месяцев
      const periodText = pluralize(
        recurrenceInterval,
        recurrenceLabels[recurrenceType],
      );
      text = `Каждые ${recurrenceInterval} ${periodText}`;
    }

    // Добавляем диапазон дат
    text += ` с ${format(startDate, "d MMMM yyyy", { locale: ru })} по ${format(endDate, "d MMMM yyyy", { locale: ru })}`;

    return text;
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{x.title || "Настройка периодичности"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Выбор дат */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Дата начала</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                  id="start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(x.startDate, "d MMMM yyyy", { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={x.startDate}
                  onSelect={handleStartDateChange}
                  locale={ru}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Дата окончания</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.endDate ? "border-red-500" : ""
                  }`}
                  id="end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(x.endDate, "d MMMM yyyy", { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={x.endDate}
                  onSelect={(date) => date && x.onEndDateChange(date)}
                  locale={ru}
                  initialFocus
                  disabled={(date) => date < x.startDate}
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && (
              <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Тип повторения и интервал */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Тип повторения */}
            <div>
              <Label htmlFor="recurrence-type" className="mb-2 block">
                Повторять
              </Label>
              <Select
                value={x.recurrenceType}
                onValueChange={(value: RecurrenceType) =>
                  x.onRecurrenceTypeChange(value)
                }
              >
                <SelectTrigger id="recurrence-type">
                  <SelectValue placeholder="Выберите тип повторения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Интервал повторения */}
            <div>
              <Label htmlFor="recurrence-interval" className="mb-2 block">
                Интервал
              </Label>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="recurrence-interval"
                  className="whitespace-nowrap"
                >
                  Каждые
                </Label>
                <Input
                  id="recurrence-interval"
                  type="number"
                  min="1"
                  value={x.recurrenceInterval}
                  onChange={(e) =>
                    x.onRecurrenceIntervalChange(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="w-16"
                />
                <span>
                  {pluralize(
                    x.recurrenceInterval,
                    recurrenceLabels[x.recurrenceType],
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Итоговый шаблон повторения */}
        <div className="pt-4 border-t">
          <div className="bg-slate-50 p-3 rounded-md">
            <p className="font-medium mb-1">Итоговый шаблон:</p>
            <p className="text-sm text-slate-700">{getRecurrenceText()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrenceIntervalSelector;
