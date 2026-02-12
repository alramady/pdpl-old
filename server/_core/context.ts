import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, PlatformUser } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { getPlatformUserById } from "../db";

const PLATFORM_COOKIE = "platform_session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  platformUser: PlatformUser | null;
};

async function authenticatePlatformUser(
  req: CreateExpressContextOptions["req"]
): Promise<PlatformUser | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies[PLATFORM_COOKIE];
    if (!token) return null;

    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const platformUserId = payload.platformUserId as number | undefined;
    if (!platformUserId) return null;

    const user = await getPlatformUserById(platformUserId);
    if (!user || user.status !== "active") return null;

    return user;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let platformUser: PlatformUser | null = null;

  // Local platform auth only (userId + password based sessions)
  platformUser = await authenticatePlatformUser(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user: null, // OAuth user is no longer used
    platformUser,
  };
}
