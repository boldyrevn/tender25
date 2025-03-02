import {
  ParticipationEndpoint,
  ParticipationResponse,
} from "@/api/endpoints/participation.endpoint";
import PriceDifferenceChart, {
  PriceDifferenceData,
} from "@/components/alert-chart";
import CategoryCharts, { CategoryData } from "@/components/category-chart";
import CategoryChartsLow, { CategoryLowData } from "@/components/category-low";
import { CreateMetric, MetricType } from "@/components/create-metric";
import SessionsChart, { SessionsResponse } from "@/components/ds-mean-chart";
import { MainLayout } from "@/components/hoc/layouts/main.layout";
import { ChartSection } from "@/components/pages/vacancy/chart-section";
import StatsChart, { StatsData } from "@/components/participation-chart";
import { ParticipationSimple } from "@/components/participation-simple";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/input";
import RecurrenceIntervalSelector, {
  RecurrenceType,
} from "@/components/ui/recurring-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Interval } from "@/types/common";
import { debounce } from "@/utils/debounce";
import { createFileRoute } from "@tanstack/react-router";
import { FileIcon, IdCardIcon, TrashIcon } from "lucide-react";
import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface DashboardCreateRequest {
  name: string;
  Interval: Interval;
  date_from: string; //python datetime
  date_to: string; //python datetime
  graphs: {
    type?: string;
    params: {
      Interval: Interval;
      Supplier?: string;
      AggBy?: "Year" | "Month";
    };
  }[];
}

export interface DashboardResponse {
  id: string;
  name: string;
  Interval: Interval;
  date_from: string; //python datetime
  date_to: string; //python datetime
  graphs: {
    type?: string;
    params: {
      Interval: Interval;
      Supplier?: string;
      AggBy?: "Year" | "Month";
    };
  }[];
}

type Chart =
  | {
      metricType: MetricType.PARTICIPATION_RESULTS;
      aggBy: "Year" | "Month";
      Supplier?: string;
      data?: StatsData;
    }
  | {
      metricType: MetricType.PARTICIPATION_RESULTS;
      aggBy: null;
      Supplier?: string;
      data?: ParticipationResponse;
    }
  | {
      metricType: MetricType.CATEGORY;
      aggBy: null;
      Supplier?: string;
      data?: CategoryData;
    }
  | {
      metricType: MetricType.CATEGORY;
      aggBy: "Year" | "Month";
      Supplier?: string;
      data?: { top: CategoryLowData[] };
    }
  | {
      metricType: MetricType.PRICE_DIFFERENCE;
      aggBy: "Year" | "Month" | null;
      Supplier?: string;
      data?: PriceDifferenceData;
    }
  | {
      metricType: MetricType.LOWER_DIFFERENCE;
      aggBy: "Year" | "Month" | null;
      Supplier?: string;
      data?: { diff: SessionsResponse["data"] };
    };

const Store = new (class {
  recurrenceType: RecurrenceType = "monthly";
  recurrenceInterval = 15;
  name = "";
  dateFrom = new Date(new Date().setMonth(new Date().getMonth() - 3));
  dateTo = new Date();
  intervalKey: "Year" | "Month" = "Year";
  charts: Chart[] = [];
  loading = false;

  get Interval() {
    const result: Interval = {};

    switch (this.recurrenceType) {
      case "daily":
        result.days = this.recurrenceInterval;
        break;
      case "weekly":
        result.weeks = this.recurrenceInterval;
        break;
      case "monthly":
        result.months = this.recurrenceInterval;
        break;
      // Add other recurrence types if needed
    }

    return result;
  }

  constructor() {
    makeAutoObservable(this);
  }

  addItem(item: MetricType, aggBy: boolean) {
    const chart: Chart = observable({
      metricType: item,
      aggBy: aggBy ? "Year" : null,
      Supplier: "7716651327", // 7716651327
    });
    this.charts.push(chart);
    this.loadData(chart);
  }

  async loadData(chart: Chart) {
    if (chart.metricType === MetricType.PARTICIPATION_RESULTS && chart.aggBy) {
      const data = await ParticipationEndpoint.aggBy({
        AggBy: chart.aggBy,
        Interval: this.Interval,
        Supplier: chart.Supplier,
      });

      chart.data = data;
    } else if (
      chart.metricType === MetricType.PARTICIPATION_RESULTS &&
      !chart.aggBy
    ) {
      const data = await ParticipationEndpoint.participation({
        Interval: this.Interval,
        Supplier: chart.Supplier,
      });

      chart.data = data;
    } else if (chart.metricType === MetricType.CATEGORY && !chart.aggBy) {
      const data = await ParticipationEndpoint.category({
        Interval: this.Interval,
        supplier: chart.Supplier,
      });

      chart.data = data;
    } else if (chart.metricType === MetricType.CATEGORY && chart.aggBy) {
      const data = await ParticipationEndpoint.categoryLow({
        Interval: this.Interval,
      });

      chart.data = data;
    } else if (chart.metricType === MetricType.PRICE_DIFFERENCE) {
      const data = await ParticipationEndpoint.priceDifference({
        Interval: this.Interval,
        Supplier: chart.Supplier,
        AggBy: chart.aggBy ?? "Year",
      });

      chart.data = data;
    } else if (chart.metricType === MetricType.LOWER_DIFFERENCE) {
      const data = await ParticipationEndpoint.lowerDiff({
        Interval: this.Interval,
        Supplier: chart.Supplier,
      });

      chart.data = data;
    }
  }

  loadDataDebounced = debounce(() => {
    this.charts.forEach((c) => this.loadData(c));
  }, 1500);

  changeSupplier = debounce((value: string, chart: Chart) => {
    chart.Supplier = value;
    this.loadData(chart);
  }, 1500);

  changeAggby = debounce((value: any, chart: Chart) => {
    chart.aggBy = value;
    this.loadData(chart);
  }, 500);

  async createDashboard() {
    this.loading = true;

    toast.success("Дашборд создан!");

    this.loading = false;
  }
})();

export const ListItem = observer(
  ({ v, i, readonly }: { v: Chart; i: number; readonly?: boolean }) => {
    return (
      <ChartSection
        title={`${v.metricType === MetricType.CATEGORY && v.aggBy ? "Категории с большим спросом, но малым покрытием" : v.metricType}`}
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              Store.charts.splice(i, 1);
            }}
          >
            <TrashIcon />
          </Button>
        }
      >
        <div className="flex items-center gap-2">
          <IconInput
            leftIcon={<IdCardIcon />}
            placeholder="ИНН компании"
            className="w-fit"
            defaultValue={v.Supplier}
            onChange={(vv) => Store.changeSupplier(vv.target.value, v)}
          />
          {v.aggBy &&
            v.metricType !== MetricType.CATEGORY &&
            v.metricType !== MetricType.LOWER_DIFFERENCE && (
              <Select
                value={v.aggBy}
                onValueChange={(vv) => Store.changeAggby(vv, v)}
              >
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Способ агрегации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Year">По годам</SelectItem>
                  <SelectItem value="Month">По месяцам</SelectItem>
                </SelectContent>
              </Select>
            )}
        </div>
        {v.metricType === MetricType.PARTICIPATION_RESULTS &&
          v.data &&
          v.aggBy === null && <ParticipationSimple {...v.data} />}
        {v.metricType === MetricType.PARTICIPATION_RESULTS &&
          v.data &&
          v.aggBy !== null && <StatsChart data={v.data} />}
        {v.metricType === MetricType.CATEGORY && v.data && v.aggBy === null && (
          <CategoryCharts data={v.data} />
        )}
        {v.metricType === MetricType.CATEGORY && v.data && v.aggBy && (
          <CategoryChartsLow data={v.data.top} />
        )}
        {v.metricType === MetricType.PRICE_DIFFERENCE && v.data && (
          <PriceDifferenceChart data={v.data} />
        )}
        {v.metricType === MetricType.LOWER_DIFFERENCE && v.data && (
          <SessionsChart data={v.data.diff} />
        )}
      </ChartSection>
    );
  },
);

const RouteComponent = observer(() => {
  useEffect(() => {
    Store.intervalKey = "Year";
    // Store.Interval = {
    //   months: 15,
    // };
    Store.name = "";
    Store.charts = [];
  }, []);

  return (
    <MainLayout
      className="space-y-5"
      header={
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Новый дашборд
          </h1>
        </div>
      }
    >
      <IconInput
        placeholder="Название дашборда"
        leftIcon={<FileIcon />}
        className="w-[300px]"
      />
      <RecurrenceIntervalSelector
        recurrenceType={Store.recurrenceType}
        recurrenceInterval={Store.recurrenceInterval}
        onRecurrenceIntervalChange={(v) => {
          Store.recurrenceInterval = v;
          Store.loadDataDebounced();
        }}
        onRecurrenceTypeChange={(v) => {
          Store.recurrenceType = v;
          Store.loadDataDebounced();
        }}
        endDate={Store.dateTo}
        startDate={Store.dateFrom}
        onEndDateChange={(v) => (Store.dateTo = v)}
        onStartDateChange={(v) => (Store.dateFrom = v)}
      />
      <ul className="space-y-3">
        {Store.charts.map((v, i) => (
          <ListItem key={i} v={v} i={i} />
        ))}
        <div className="flex items-center gap-2">
          <CreateMetric
            onSelect={(item, aggBy) => {
              Store.addItem(item, aggBy);
            }}
            disabled={Store.loading}
          />
          <Button variant="outline" disabled={Store.loading}>
            Создать дашборд
          </Button>
        </div>
      </ul>
    </MainLayout>
  );
});

export const Route = createFileRoute("/_base/new")({
  component: RouteComponent,
});
