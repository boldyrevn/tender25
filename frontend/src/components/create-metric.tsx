import { PlusIcon, RussianRuble } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/utils/cn";

export enum MetricType {
  PARTICIPATION_RESULTS = "Результаты участий в котировочных сессиях",
  CATEGORY = "Информация по категориям участия",
  PRICE_DIFFERENCE = "Сумма контрактов",
  LOWER_DIFFERENCE = "Проседание от заданной цены по КС у поставщика",
  COMPETITORS = "Среднее количество конкурентов в сессии",
  VICTORY = "Выигранные КС на заказчика",
}

interface Props {
  onSelect: (metric: MetricType, aggBy: boolean) => void;
  disabled: boolean;
}

export const CreateMetric = ({ onSelect, disabled }: Props) => {
  const [aggBy, setAggBy] = useState(false);
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<MetricType | null>(null);

  const onSubmit = () => {
    if (!metric) {
      toast.error("Выберите метрику");
      return;
    }
    onSelect(metric, aggBy);
    setOpen(false);
    setMetric(null);
    setAggBy(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setMetric(null);
          setAggBy(false);
        }
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <PlusIcon />
          Добавить метрику
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Создать метрику</DialogTitle>
          </DialogHeader>
          <Select
            onValueChange={(value) => {
              setMetric(value as MetricType);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите метрику" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MetricType.PARTICIPATION_RESULTS}>
                {MetricType.PARTICIPATION_RESULTS}
              </SelectItem>
              <SelectItem value={MetricType.CATEGORY}>
                {MetricType.CATEGORY}
              </SelectItem>
              <SelectItem value={MetricType.PRICE_DIFFERENCE}>
                {MetricType.PRICE_DIFFERENCE}
              </SelectItem>
              <SelectItem value={MetricType.LOWER_DIFFERENCE}>
                {MetricType.LOWER_DIFFERENCE}
              </SelectItem>
              <SelectItem value={MetricType.COMPETITORS}>
                {MetricType.COMPETITORS}
              </SelectItem>
              <SelectItem value={MetricType.VICTORY}>
                {MetricType.VICTORY}
              </SelectItem>
            </SelectContent>
          </Select>
          {metric !== MetricType.PRICE_DIFFERENCE &&
            metric !== MetricType.LOWER_DIFFERENCE &&
            metric !== MetricType.COMPETITORS &&
            metric !== MetricType.VICTORY && (
              <label
                className={cn(
                  "flex items-center gap-2 w-fit",
                  !metric && "hidden",
                )}
              >
                <Checkbox
                  onCheckedChange={(checked) => {
                    setAggBy(checked === true);
                  }}
                />
                {metric === MetricType.PARTICIPATION_RESULTS && "Графики"}
                {metric === MetricType.CATEGORY &&
                  "С большим спросом, но малым покрытием"}
              </label>
            )}
          <Button type="submit">Добавить</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
