import { describe, expect, it } from "vitest";
import { roleAtLeast, canManageReports, canViewReports } from "@/shared/rbac";

describe("roleAtLeast", () => {
  it("owner is the highest privilege", () => {
    expect(roleAtLeast("owner", "owner")).toBe(true);
    expect(roleAtLeast("owner", "viewer")).toBe(true);
  });

  it("viewer is the lowest privilege", () => {
    expect(roleAtLeast("viewer", "viewer")).toBe(true);
    expect(roleAtLeast("viewer", "member")).toBe(false);
  });

  it("manager is above member", () => {
    expect(roleAtLeast("manager", "manager")).toBe(true);
    expect(roleAtLeast("manager", "member")).toBe(true);
    expect(roleAtLeast("member", "manager")).toBe(false);
  });

  it("unknown roles fall to the lowest rank", () => {
    expect(roleAtLeast("guest", "viewer")).toBe(false);
    expect(roleAtLeast("guest", "admin")).toBe(false);
  });
});

describe("canManageReports", () => {
  it("allows owner/admin/manager", () => {
    expect(canManageReports("owner")).toBe(true);
    expect(canManageReports("admin")).toBe(true);
    expect(canManageReports("manager")).toBe(true);
  });

  it("denies member/viewer", () => {
    expect(canManageReports("member")).toBe(false);
    expect(canManageReports("viewer")).toBe(false);
  });
});

describe("canViewReports", () => {
  it("allows all roles including viewer", () => {
    expect(canViewReports("owner")).toBe(true);
    expect(canViewReports("viewer")).toBe(true);
    expect(canViewReports("member")).toBe(true);
  });
});
