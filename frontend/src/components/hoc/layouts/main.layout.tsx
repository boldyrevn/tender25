import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { ReactNode } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title?: string;
  header?: ReactNode;
  className?: string;
}

export const MainLayout: FC<Props> = observer((x) => {
  return (
    <main className="size-full grid grid-rows-[auto_1fr] pt-6 gap-6 px-4 sm:px-8 mx-auto 2xl:ml-8 max-w-screen-xl">
      {x.header
        ? x.header
        : x.title && (
            <h1 className="text-3xl font-semibold text-slate-900">{x.title}</h1>
          )}
      <ScrollArea className="flex flex-col h-full">
        <div className={cn("pb-20 sm:pb-4", x.className)}>{x.children}</div>
      </ScrollArea>
    </main>
  );
});
