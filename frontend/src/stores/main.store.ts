import { makeAutoObservable } from "mobx";
import { z } from "zod";

const nonEmptyString = () => z.string().trim().min(1, "Введите значение");

export const MetrikaTemplate = z.object({
  name: nonEmptyString(),
});
export type MetrikaTemplate = z.infer<typeof MetrikaTemplate>;

export const MainStore = new (class {
  page: null | string | "new" = null;
  newMetrika: MetrikaTemplate | null = null;

  constructor() {
    makeAutoObservable(this);
  }
})();
