import api from "api/utils/api";
import { Query } from "../utils/buildQueryString";
import { VacancyDto } from "../models/vacancy.model";
import { paged } from "../models/paged.model";
import { z } from "zod";
import { Priority } from "@/types/priority.type";

export namespace VacancyEndpoint {
  export interface ListTemplate extends Query {
    isAppointed?: boolean;
    byDateDeadline?: boolean;
    byDateCreation?: boolean;
    byPriority?: boolean;
    page: number;
    size: number;
  }
  export const list = (search: ListTemplate) => ({
    page: 1,
    size: 10,
    items: [
      {
        id: 1,
        name: "Software Engineer",
        priority: "High",
        deadline: "2025-03-15",
        profession: "Engineering",
        area: "Software Development",
        supervisor: "John Doe",
        city: "New York",
        experience_from: 3,
        experience_to: 5,
        education: "Bachelor's in Computer Science",
        quantity: 2,
        description: "Develop and maintain web applications.",
        type_of_employment: "Full-time",
        vacancy_skills: [
          { name: "JavaScript", level: "Advanced" },
          { name: "React", level: "Intermediate" },
        ],
        recruiter: null,
        hr: null,
        created_at: "2025-02-28",
      },
      {
        id: 2,
        name: "Data Analyst",
        priority: "Medium",
        deadline: "2025-04-01",
        profession: "Analytics",
        area: "Data Science",
        supervisor: "Jane Smith",
        city: "San Francisco",
        experience_from: 2,
        experience_to: 4,
        education: "Master's in Data Science",
        quantity: 1,
        description: "Analyze and interpret complex data sets.",
        type_of_employment: "Contract",
        vacancy_skills: [
          { name: "SQL", level: "Advanced" },
          { name: "Python", level: "Intermediate" },
        ],
        recruiter: null,
        hr: null,
        created_at: "2025-02-25",
      },
    ],
    total: 2,
    pages: 1,
  });

  // api.get("/vacancies/all/active", {
  //   search,
  //   schema: paged(VacancyDto.Item),
  // });

  export const getById = (id: string) =>
    api.get(`/vacancies/roadmap/${id}`, {
      schema: VacancyDto.DetailedItem,
    });

  interface VacancyTemplate {
    name: string;
    priority: Priority.Priority;
    deadline: string;
    profession: string;
    area: string;
    supervisor: string;
    city: string;
    experienceFrom: string;
    experienceTo: string;
    education: string;
    keySkills: number[];
    additionalSkills: number[];
    description: string;
    typeOfEmployment: string;
    quantity: number;
    direction: string;
    salary_low: number;
    salary_high: number;
    stages: {
      order: number;
      name: string;
      duration: number;
    }[];
  }
  export const create = (vacancy: VacancyTemplate) =>
    api.post("/vacancies/new", vacancy, {
      schema: z.number(),
    });
}
