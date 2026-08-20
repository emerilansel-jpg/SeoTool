import { AppError } from "@/server/lib/errors";
import { isPlatformAdminId } from "@/server/lib/platform-admin";
import { AdminUserRepository } from "../repositories/AdminUserRepository";

export const AdminUserService = {
  async searchUsers(input: {
    search?: string;
    page: number;
    pageSize: number;
  }) {
    return AdminUserRepository.listUsers({
      search: input.search,
      limit: input.pageSize,
      offset: (input.page - 1) * input.pageSize,
    });
  },

  async getUserDetail(userId: string) {
    const detail = await AdminUserRepository.getUserDetail(userId);
    if (!detail) {
      throw new AppError("NOT_FOUND", "User not found.");
    }
    return detail;
  },

  async banUser(
    input: { userId: string; banReason?: string },
    adminUserId: string,
  ): Promise<void> {
    if (input.userId === adminUserId) {
      throw new AppError("VALIDATION_ERROR", "You cannot ban yourself.");
    }
    if (await isPlatformAdminId(input.userId)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "This user is a platform admin and cannot be banned.",
      );
    }
    await AdminUserRepository.banUser(
      input.userId,
      input.banReason?.trim() || null,
    );
  },

  async unbanUser(input: { userId: string }): Promise<void> {
    await AdminUserRepository.unbanUser(input.userId);
  },

  async forceLogout(input: { userId: string }, adminUserId: string) {
    if (input.userId === adminUserId) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Use sign out to end your own sessions.",
      );
    }
    await AdminUserRepository.revokeSessions(input.userId);
  },
};
