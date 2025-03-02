import { z } from "zod";
import api from "../utils/api";
import { Interval } from "@/types/common";
import { StatsData } from "@/components/participation-chart";
import { CategoryData } from "@/components/category-chart";

// {
//   "Interval": {
//     "days": 0,
//     "weeks": 0,
//     "months": 0
//   },
//   "Supplier": "string"
// }
interface ParticipationRequest {
  Interval: Interval;
  Supplier?: string;
}

export const ParticipationResponse = z.object({
  won: z.number(),
  lose: z.number(),
  won_perc: z.number(),
});
export type ParticipationResponse = z.infer<typeof ParticipationResponse>;

interface AggByRequest extends ParticipationRequest {
  AggBy: "Month" | "Year";
}
// export const AggByResponse = z.object({
//   won: z.number(),
//   lose: z.any(),
//   won_perc: z.any(),
// });
// export type AggByResponse = z.infer<typeof AggByResponse>;

export namespace ParticipationEndpoint {
  export const participation = (request: ParticipationRequest) =>
    api.post("/participation", request, {
      schema: ParticipationResponse,
    });

  export const aggBy = (request: AggByRequest): Promise<StatsData> =>
    api.post("/participation/aggby", request);

  export const category = (
    request: ParticipationRequest & { supplier?: string },
  ): Promise<CategoryData> => api.post("/category", request);

  export const categoryLow = (request: ParticipationRequest): Promise<any> =>
    api.post("/category/high-demand", request);

  export const priceDifference = (request: AggByRequest): Promise<any> =>
    Promise.all([
      api.post("/amount/sessions", request),
      api.post("/amount/aggby", request).catch(() => ({ amt: 0 })),
    ]).then(([v1, v2]) => ({ ...v1, ...v2 }));

  export const lowerDiff = (request: ParticipationRequest): Promise<any> =>
    api.post("/diff_base_cost", request);

  export const competitors = (request: ParticipationRequest): Promise<any> =>
    api.post("/competitors", request);

  export const victory = (request: ParticipationRequest): Promise<any> =>
    api.post("/victory-stat", request);

  export const create = (request: any): Promise<any> =>
    api.post("/dashboard", request);
}
