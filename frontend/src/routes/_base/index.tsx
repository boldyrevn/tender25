import { VacancyEndpoint } from "@/api/endpoints/vacanvy.endpoint";
import { MainLayout } from "@/components/hoc/layouts/main.layout";
import { IconInput } from "@/components/ui/input";
import { RecurringEventSelector } from "@/components/ui/recurring-event";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";

const Page = observer(() => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <MainLayout
      header={
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Все вакансии
          </h1>
          <IconInput
            placeholder="Поиск"
            containerClassName="h-min mt-auto"
            value={search}
            leftIcon={<SearchIcon />}
            onChange={(e) => setSearch(e.target.value)}
          />
          <RecurringEventSelector />
        </div>
      }
    ></MainLayout>
  );
});

export const Route = createFileRoute("/_base/")({
  component: Page,
});
