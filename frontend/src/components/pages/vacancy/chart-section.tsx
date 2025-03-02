import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ReactNode } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, PropsWithChildren, useState } from "react";

interface Props extends PropsWithChildren {
  title: string;
  description?: string;
  collapsible?: boolean;
  actions?: ReactNode;
  allowOverflow?: boolean;
}

export const ChartSection: FC<Props> = observer(
  ({ collapsible = true, ...x }) => {
    return (
      <section className="bg-white rounded-2xl border w-full py-5">
        <div className="grid-cols-[auto_auto] grid-flow-dense grid lg:flex justify-between px-5 pb-0 items-center gap-1">
          <h2
            className={cn(
              "text-lg font-medium",
              collapsible && "text-slate-500",
            )}
          >
            {x.title}
          </h2>
          {x.actions && <div className="col-span-2 ml-auto">{x.actions}</div>}
          <div className="flex items-center gap-1"></div>
        </div>
        {x.description && <p className="text-sm mt-2 px-5">{x.description}</p>}
        <div
          className={cn(
            "flex flex-col mt-3 px-5",
            x.allowOverflow && "overflow-visible",
          )}
        >
          {x.children}
        </div>
      </section>
    );
  },
);
