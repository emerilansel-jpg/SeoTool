import type { z } from "zod";
import { AlertRepository } from "../repositories/AlertRepository";
import { AppError } from "@/server/lib/errors";
import type {
  createAlertRuleSchema,
  updateAlertRuleSchema,
} from "@/types/schemas/alerts";

export const AlertService = {
  async listForProject(projectId: string) {
    return AlertRepository.listForProject(projectId);
  },

  async getById(id: string, projectId: string) {
    const rule = await AlertRepository.getById(id, projectId);
    if (!rule) {
      throw new AppError("NOT_FOUND", "Alert rule not found");
    }
    return rule;
  },

  async create(data: z.infer<typeof createAlertRuleSchema>) {
    const id = crypto.randomUUID();
    return AlertRepository.create(id, data);
  },

  async update(
    id: string,
    projectId: string,
    data: z.infer<typeof updateAlertRuleSchema>,
  ) {
    await AlertService.getById(id, projectId);
    return AlertRepository.update(id, projectId, data);
  },

  async delete(id: string, projectId: string) {
    await AlertService.getById(id, projectId);
    await AlertRepository.delete(id, projectId);
  },
};
