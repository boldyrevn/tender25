import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CheckSquareIcon,
  LayoutDashboard,
  MenuIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "../ui/button";
import { FC, useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { MainStore } from "@/stores/main.store";

const transitionProps = {
  initial: { opacity: 0, translateX: -20 },
  animate: { opacity: 1, translateX: 0 },
  exit: { opacity: 0, translateX: -20 },
};

const items: {
  to: string;
  label: string;
  icon: React.ElementType;
  active?: (v: string) => boolean;
  disabled?: boolean;
}[] = [
  {
    to: "/",
    label: "Дашборды",
    icon: LayoutDashboard,
    active: (pathname) =>
      pathname.includes("/vacancy") && !pathname.includes("/vacancy/new"),
  },
  {
    to: "/tasks",
    label: "Мои задачи",
    icon: CheckSquareIcon,
  },
];

const SidebarContent = observer(() => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <ScrollArea className="py-4 h-full">
      <ul className="flex flex-col gap-1 px-2">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              to={item.to}
              disabled={item.disabled}
              className={cn(
                item.active?.(pathname) && "active",
                "font-medium flex items-center gap-2 px-4 py-4 sm:py-2 text-sm text-slate-700 rounded-md",
                item.disabled ? "opacity-50" : "hover:bg-slate-100",
                "[&.active]:text-primary",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mx-6 my-5">
        <Button
          onClick={() => (MainStore.page = "new")}
          className={"w-full gap-1"}
          disabled={pathname.includes("/vacancy/new")}
        >
          <PlusIcon className="size-5" />
          Создать дашборд
        </Button>
      </div>
    </ScrollArea>
  );
});

const SidebarMobile = observer(({ hideSidebar }: { hideSidebar?: boolean }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Drawer open={open && !hideSidebar} onOpenChange={setOpen}>
      {!hideSidebar && (
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="px-3 absolute top-4 right-4 z-10 block sm:hidden"
          >
            <MenuIcon className="size-5" />
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent className="min-h-[60vh]">
        <SidebarContent />
      </DrawerContent>
    </Drawer>
  );
});

export const Sidebar: FC<{ hideSidebar?: boolean }> = observer(
  ({ hideSidebar }) => {
    const [hidden, setHidden] = useState(false);

    return (
      <AnimatePresence mode="popLayout" initial={false}>
        {!hideSidebar && (
          <motion.aside
            key="sidebar"
            {...transitionProps}
            className={cn(
              "h-full overflow-hidden w-64 bg-white shadow-md hidden sm:block",
            )}
          >
            <SidebarContent />
          </motion.aside>
        )}
        <SidebarMobile />
      </AnimatePresence>
    );
  },
);
