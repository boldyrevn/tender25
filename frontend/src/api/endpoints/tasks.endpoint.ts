import { z } from "zod";
import { SkillDto } from "../models/skill.model";
import api from "../utils/api";
import { TaskDto } from "../models/task.model";

export namespace TasksEndpoint {
  export const list = () => {
    return [
      {
        deadline: "2025-03-10",
        candidate_id: 101,
        stage_name: "Initial Screening",
        vacancy_name: "Software Engineer",
        stage_url: "https://company.com/stages/101",
      },
      {
        deadline: "2025-03-12",
        candidate_id: 102,
        stage_name: "Technical Interview",
        vacancy_name: "Data Analyst",
        stage_url: "https://company.com/stages/102",
      },
      {
        deadline: "2025-03-15",
        candidate_id: 103,
        stage_name: "HR Interview",
        vacancy_name: "Product Manager",
        stage_url: "https://company.com/stages/103",
      },
    ];

    // return api.get("/vacancies/recruiter/stages", {
    //   schema: z.array(TaskDto.Item),
    // });
  };
}
