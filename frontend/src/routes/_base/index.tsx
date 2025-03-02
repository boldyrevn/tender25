import { MainLayout } from "@/components/hoc/layouts/main.layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import { DashboardResponse } from "./new";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DisposableVm, useViewModel } from "@/utils/vm";
import { useEffect } from "react";

class PageStore implements DisposableVm {
  dashboards: { name: string; id: string }[] = [];
  dashboard: DashboardResponse | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  dispose(): void {}

  async load(id?: string) {}
}

const Page = observer(() => {
  const search = Route.useSearch();
  const vm = useViewModel(PageStore);

  useEffect(() => {
    vm.load(search.id);
  }, [search.id, vm]);

  return (
    <MainLayout
      header={
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Дашборды</h1>
          {/* <RecurringEventSelector /> */}
          <Tabs>
            <TabsList>
              {vm.dashboards.map((v, i) => (
                <TabsTrigger key={i} value={v.id}>
                  {v.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {vm.dashboards.map((v, i) => (
              <TabsContent key={i} value={v.id}></TabsContent>
            ))}
          </Tabs>
        </div>
      }
    ></MainLayout>
  );
});

export const Route = createFileRoute("/_base/")({
  component: Page,
  validateSearch: zodValidator(
    z.object({
      id: fallback(z.string().optional(), undefined),
    }),
  ),
});
