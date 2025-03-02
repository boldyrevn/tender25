import React, { useState, useEffect } from "react";
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
import {
  format,
  addDays,
  isValid,
  isBefore,
  setHours,
  setMinutes,
} from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { pluralize } from "@/utils/pluralize";

// Типы для дней недели
type WeekdayId =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type SelectedWeekdays = Record<WeekdayId, boolean>;

// Типы для периодичности
type RecurrenceType = "daily" | "weekly" | "monthly";

// Интерфейс для формы событий
interface FormState {
  startDate: Date;
  endDate: Date;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  selectedWeekdays: SelectedWeekdays;
}

// Интерфейс для ошибок валидации
interface FormErrors {
  startDate?: string;
  endDate?: string;
  weekdays?: string;
  recurrenceInterval?: string;
}

// Интерфейс для результата настройки повторения
interface RecurrenceConfig {
  startDate: Date;
  endDate: Date;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  selectedWeekdays: WeekdayId[];
  summary: string;
}

// Интерфейс для пропсов компонента
interface RecurringEventSelectorProps {
  onValueChange?: (config: RecurrenceConfig) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

// Интерфейс для описания дня недели
interface WeekdayInfo {
  id: WeekdayId;
  label: string;
  fullName: string;
}

export const RecurringEventSelector: React.FC<RecurringEventSelectorProps> = (
  x,
) => {
  // Инициализация дат - начало сегодня, окончание через 30 дней
  const today = x.initialStartDate || new Date();
  const initialEndDate = x.initialEndDate || addDays(today, 30);

  // Состояние формы
  const [formState, setFormState] = useState<FormState>({
    startDate: today,
    endDate: initialEndDate,
    recurrenceType: "weekly",
    recurrenceInterval: 1,
    selectedWeekdays: {
      monday: today.getDay() === 1,
      tuesday: today.getDay() === 2,
      wednesday: today.getDay() === 3,
      thursday: today.getDay() === 4,
      friday: today.getDay() === 5,
      saturday: today.getDay() === 6,
      sunday: today.getDay() === 0,
    },
  });

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<FormErrors>({});

  // Определения дней недели
  const weekdays: WeekdayInfo[] = [
    { id: "monday", label: "Пн", fullName: "Понедельник" },
    { id: "tuesday", label: "Вт", fullName: "Вторник" },
    { id: "wednesday", label: "Ср", fullName: "Среда" },
    { id: "thursday", label: "Чт", fullName: "Четверг" },
    { id: "friday", label: "Пт", fullName: "Пятница" },
    { id: "saturday", label: "Сб", fullName: "Суббота" },
    { id: "sunday", label: "Вс", fullName: "Воскресенье" },
  ];

  // Таблица для склонения
  const recurrenceLabels: Record<RecurrenceType, [string, string, string]> = {
    daily: ["день", "дня", "дней"],
    weekly: ["неделю", "недели", "недель"],
    monthly: ["месяц", "месяца", "месяцев"],
  };

  // Обновление состояния формы
  const updateFormState = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ): void => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Обработка изменения даты начала
  const handleStartDateChange = (date: Date | undefined): void => {
    if (!date) return;

    // Сохраняем текущее время
    const hours = formState.startDate.getHours();
    const minutes = formState.startDate.getMinutes();

    // Применяем то же время к новой дате
    const newDate = setMinutes(setHours(date, hours), minutes);
    updateFormState("startDate", newDate);

    // Если дата окончания раньше новой даты начала, обновляем дату окончания
    if (isBefore(formState.endDate, newDate)) {
      updateFormState("endDate", addDays(newDate, 1));
    }
  };

  // Обработчик изменения времени для даты начала
  const handleStartTimeChange = (time: string): void => {
    if (!time) return;

    const [hours, minutes] = time.split(":").map(Number);
    const newDate = setMinutes(setHours(formState.startDate, hours), minutes);
    updateFormState("startDate", newDate);

    // Проверяем, не стала ли теперь дата начала позже даты окончания
    if (isBefore(formState.endDate, newDate)) {
      // Копируем то же время в дату окончания и добавляем 1 день
      const newEndDate = addDays(newDate, 1);
      updateFormState("endDate", newEndDate);
    }
  };

  // Обработчик изменения времени для даты окончания
  const handleEndTimeChange = (time: string): void => {
    if (!time) return;

    const [hours, minutes] = time.split(":").map(Number);
    const newDate = setMinutes(setHours(formState.endDate, hours), minutes);
    updateFormState("endDate", newDate);
  };

  // Обработка выбора дня недели
  const handleWeekdayChange = (id: WeekdayId): void => {
    updateFormState("selectedWeekdays", {
      ...formState.selectedWeekdays,
      [id]: !formState.selectedWeekdays[id],
    });
  };

  // Валидация формы
  useEffect(() => {
    const {
      startDate,
      endDate,
      recurrenceType,
      recurrenceInterval,
      selectedWeekdays,
    } = formState;
    const newErrors: FormErrors = {};

    // Валидация дат
    if (!isValid(startDate)) {
      newErrors.startDate = "Неверная дата начала";
    }

    if (!isValid(endDate)) {
      newErrors.endDate = "Неверная дата окончания";
    }

    if (
      isValid(startDate) &&
      isValid(endDate) &&
      startDate.getTime() >= endDate.getTime()
    ) {
      newErrors.endDate =
        "Дата и время окончания должны быть позже даты и времени начала";
    }

    // Валидация дней недели для еженедельного повторения
    if (recurrenceType === "weekly") {
      const anyWeekdaySelected = Object.values(selectedWeekdays).some(
        (value) => value,
      );
      if (!anyWeekdaySelected) {
        newErrors.weekdays = "Выберите хотя бы один день недели";
      }
    }

    // Валидация интервала повторения
    if (recurrenceInterval < 1) {
      newErrors.recurrenceInterval = "Интервал должен быть не менее 1";
    }

    setErrors(newErrors);

    // Уведомляем родительский компонент, если нет ошибок
    if (x.onValueChange && Object.keys(newErrors).length === 0) {
      x.onValueChange({
        startDate,
        endDate,
        recurrenceType,
        recurrenceInterval,
        selectedWeekdays: Object.entries(selectedWeekdays)
          .filter(([_, isSelected]) => isSelected)
          .map(([day]) => day as WeekdayId),
        summary: getRecurrenceText(),
      });
    }
  }, [formState, x.onValueChange]);

  // Генерация текста выбранных дней недели
  const getSelectedWeekdaysText = (): string => {
    const selected = Object.entries(formState.selectedWeekdays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => {
        const weekday = weekdays.find((w) => w.id === (day as WeekdayId));
        return weekday?.fullName || "";
      });

    if (selected.length === 0) return "Не выбрано";
    if (selected.length === 7) return "Каждый день";

    return selected.join(", ");
  };

  // Генерация текста шаблона повторения
  const getRecurrenceText = (): string => {
    const { startDate, endDate, recurrenceType, recurrenceInterval } =
      formState;
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

    // Добавляем дни недели для еженедельного повторения
    if (recurrenceType === "weekly") {
      const weekdaysText = getSelectedWeekdaysText();
      if (weekdaysText !== "Не выбрано" && weekdaysText !== "Каждый день") {
        text += ` по дням: ${weekdaysText}`;
      }
    }

    // Добавляем диапазон дат с временем
    text += ` с ${format(startDate, "d MMMM yyyy HH:mm", { locale: ru })} по ${format(endDate, "d MMMM yyyy HH:mm", { locale: ru })}`;

    return text;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Настройка повторяющегося события</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Выбор дат */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Дата и время начала</Label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex-1 justify-start text-left font-normal ${
                      errors.startDate ? "border-red-500" : ""
                    }`}
                    id="start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formState.startDate, "d MMMM yyyy", { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.startDate}
                    onSelect={handleStartDateChange}
                    locale={ru}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  className="pl-8 w-24"
                  value={format(formState.startDate, "HH:mm")}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                />
              </div>
            </div>
            {errors.startDate && (
              <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Дата и время окончания</Label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex-1 justify-start text-left font-normal ${
                      errors.endDate ? "border-red-500" : ""
                    }`}
                    id="end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formState.endDate, "d MMMM yyyy", { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.endDate}
                    onSelect={(date) => {
                      if (!date) return;
                      // Сохраняем текущее время
                      const hours = formState.endDate.getHours();
                      const minutes = formState.endDate.getMinutes();
                      // Применяем то же время к новой дате
                      const newDate = setMinutes(
                        setHours(date, hours),
                        minutes,
                      );
                      updateFormState("endDate", newDate);
                    }}
                    locale={ru}
                    initialFocus
                    disabled={(date) => {
                      // Разрешаем выбрать ту же дату, если время окончания позже времени начала
                      const startDateTime = formState.startDate.getTime();
                      const sameDay =
                        date.getDate() === formState.startDate.getDate() &&
                        date.getMonth() === formState.startDate.getMonth() &&
                        date.getFullYear() ===
                          formState.startDate.getFullYear();

                      return date < formState.startDate && !sameDay;
                    }}
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  className="pl-8 w-24"
                  value={format(formState.endDate, "HH:mm")}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                />
              </div>
            </div>
            {errors.endDate && (
              <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Тип повторения и интервал */}
        <div className="space-y-4">
          <Label>Повторение</Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Тип повторения */}
            <div>
              <Select
                value={formState.recurrenceType}
                onValueChange={(value: RecurrenceType) =>
                  updateFormState("recurrenceType", value)
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
                value={formState.recurrenceInterval}
                onChange={(e) =>
                  updateFormState(
                    "recurrenceInterval",
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className={`w-16 ${errors.recurrenceInterval ? "border-red-500" : ""}`}
              />
              <span>
                {pluralize(
                  formState.recurrenceInterval,
                  recurrenceLabels[formState.recurrenceType],
                )}
              </span>
            </div>
            {errors.recurrenceInterval && (
              <p className="text-sm text-red-500 mt-1 col-span-full">
                {errors.recurrenceInterval}
              </p>
            )}
          </div>
        </div>

        {/* Выбор дней недели - показываем только для еженедельного повторения */}
        {formState.recurrenceType === "weekly" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Дни недели</Label>
              {errors.weekdays && (
                <p className="text-sm text-red-500">{errors.weekdays}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              {weekdays.map((day) => (
                <div key={day.id} className="flex items-center">
                  <Button
                    type="button"
                    variant={
                      formState.selectedWeekdays[day.id] ? "default" : "outline"
                    }
                    className={`h-10 w-10 p-0 rounded-full ${
                      errors.weekdays &&
                      !Object.values(formState.selectedWeekdays).some(
                        (val) => val,
                      )
                        ? "border-red-500"
                        : ""
                    }`}
                    onClick={() => handleWeekdayChange(day.id)}
                    title={day.fullName}
                  >
                    {day.label}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Итоговый шаблон повторения */}
        <div className="pt-4 border-t">
          <div className="bg-slate-50 p-3 rounded-md">
            <p className="font-medium mb-1">Итоговое расписание:</p>
            <p className="text-sm text-slate-700">{getRecurrenceText()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
