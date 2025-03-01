import { ReactNode, useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CheckIcon, ChevronsUpDown, XIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/utils/cn";

interface Props<T> {
  value?: T[];
  onChange?: (items: NoInfer<T>[]) => void;
  displayValueFn?: (item: NoInfer<T>) => ReactNode;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
}

interface SimpleSearchMultiSelectProps<T> extends Props<T> {
  advancedSearch?: false;
  options: T[];
}

interface AdvancedSearchMultiSelectProps<T> extends Props<T> {
  advancedSearch: true;
  onSearch: (search: string) => Promise<T[]>;
}

type MultiSelectProps<T> =
  | SimpleSearchMultiSelectProps<T>
  | AdvancedSearchMultiSelectProps<T>;

export const MultiSelect = <T,>(x: MultiSelectProps<T>) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<T[]>(
    x.advancedSearch ? [] : x.options,
  );

  useEffect(() => {
    const fetchOptions = async () => {
      if (x.advancedSearch) {
        const res = await x.onSearch(search);

        setFilteredOptions(res);
      }
    };

    void fetchOptions();
  }, [search, x.advancedSearch]);

  const handleSelect = useCallback(
    (v: T) => {
      if (!x.value) {
        x.onChange?.([v]);
        return;
      }

      const newSelection = x.value.some((vv) => vv === v)
        ? x.value.filter((vv) => vv !== v)
        : [...x.value, v];

      x.onChange?.(newSelection);
    },
    [x.value, x.onChange],
  );

  const displayValue = useCallback(
    (v: T) => {
      if (x.displayValueFn) return x.displayValueFn(v);

      if (typeof v === "string") return v;

      throw new Error("displayValueFn was not provided");
    },
    [x.displayValueFn],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={x.disabled}
        className="bg-card flex min-h-13 flex-grow cursor-pointer items-center overflow-hidden rounded-2xl border px-6 py-2 text-sm"
      >
        {x.value && x.value?.length > 0 ? (
          <div className="flex flex-grow flex-wrap items-center gap-2 overflow-hidden">
            {x.value.map((v, i) => (
              <div
                key={i}
                className="bg-tag flex items-center gap-0.5 rounded-sm py-1 pr-2 pl-3"
              >
                <span>{displayValue(v)}</span>
                <button
                  type="button"
                  onClick={() => handleSelect(v)}
                  className="cursor-pointer"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">
            {x.placeholder ?? "Выберите опции"}
          </span>
        )}
        <ChevronsUpDown
          size={16}
          className="text-muted-foreground ml-auto size-4 shrink-0"
        />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-(--radix-popper-anchor-width) p-0"
      >
        <Command className="max-h-[200px] w-full sm:max-h-[270px]">
          <CommandList>
            <div className="bg-card sticky top-0 z-10">
              <CommandInput
                placeholder={x.searchPlaceholder ?? "Поиск..."}
                value={search}
                onValueChange={setSearch}
              />
            </div>
            <CommandEmpty>Результатов не найдено</CommandEmpty>
            <CommandGroup className="bg-card">
              {filteredOptions.map((v, key) => (
                <CommandItem
                  key={key}
                  className="flex w-full items-center gap-2"
                  onSelect={() => handleSelect(v)}
                >
                  <span className="truncate">{displayValue(v)}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      x.value?.some((vv) => vv === v)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
