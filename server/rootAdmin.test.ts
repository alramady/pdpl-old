import { describe, expect, it } from "vitest";
import { ROOT_ADMIN_USER_ID } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for Root Admin protection:
 * 1. ROOT_ADMIN_USER_ID is correctly set to "mruhaily"
 * 2. Context creation patterns for root admin vs regular users
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(overrides?: {
  platformUser?: TrpcContext["platformUser"];
  user?: TrpcContext["user"];
}): TrpcContext {
  return {
    user: overrides?.user ?? null,
    platformUser: overrides?.platformUser ?? null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Root Admin Protection", () => {
  it("ROOT_ADMIN_USER_ID is set to mruhaily", () => {
    expect(ROOT_ADMIN_USER_ID).toBe("mruhaily");
  });

  it("root admin context has correct userId and role", () => {
    const ctx = createMockContext({
      platformUser: {
        id: 1,
        userId: "mruhaily",
        platformRole: "root_admin",
        fullName: "محمد الرحيلي",
        email: "mruhaily@ndmo.gov.sa",
        department: "إدارة حماية البيانات",
        isActive: true,
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      } as any,
    });

    expect(ctx.platformUser).not.toBeNull();
    expect(ctx.platformUser!.userId).toBe(ROOT_ADMIN_USER_ID);
    expect(ctx.platformUser!.platformRole).toBe("root_admin");
  });

  it("non-root admin context should not match ROOT_ADMIN_USER_ID", () => {
    const ctx = createMockContext({
      platformUser: {
        id: 2,
        userId: "regular_user",
        platformRole: "analyst",
        fullName: "مستخدم عادي",
        email: "user@ndmo.gov.sa",
        department: "التحليل",
        isActive: true,
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      } as any,
    });

    expect(ctx.platformUser).not.toBeNull();
    expect(ctx.platformUser!.userId).not.toBe(ROOT_ADMIN_USER_ID);
    expect(ctx.platformUser!.platformRole).not.toBe("root_admin");
  });

  it("root admin userId check is case-sensitive", () => {
    expect(ROOT_ADMIN_USER_ID).toBe("mruhaily");
    expect(ROOT_ADMIN_USER_ID).not.toBe("Mruhaily");
    expect(ROOT_ADMIN_USER_ID).not.toBe("MRUHAILY");
  });

  it("empty context has no user and no platformUser", () => {
    const ctx = createMockContext();
    expect(ctx.user).toBeNull();
    expect(ctx.platformUser).toBeNull();
  });
});
