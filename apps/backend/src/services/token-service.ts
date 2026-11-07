import { randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { RefreshToken } from "@/models/refresh-token-entity.js";
import { AppError } from "@/utils/app-error.js";

// Read lazily: the env files are loaded in server.ts after the imports are evaluated.
function jwtConfig() {
  const required = (name: string) =>
    process.env[name] ??
    (() => {
      throw new Error(`${name} is not defined`);
    })();

  return {
    secret: required("JWT_SECRET"),
    issuer: required("JWT_Issuer"),
    audience: required("JWT_Audience"),
    accessExpiration: required("ACCESS_TOKEN_EXPIRATION") as SignOptions["expiresIn"],
    refreshExpiration: required("REFRESH_TOKEN_EXPIRATION") as SignOptions["expiresIn"],
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function issueTokenPair(
  userId: string,
  family: string = randomUUID(),
): Promise<TokenPair> {
  const { secret, issuer, audience, accessExpiration, refreshExpiration } =
    jwtConfig();
  const base = { issuer, audience, subject: userId };

  const accessToken = jwt.sign({ type: "access" }, secret, {
    ...base,
    expiresIn: accessExpiration,
  });

  const jti = randomUUID();
  const refreshToken = jwt.sign({ type: "refresh", family }, secret, {
    ...base,
    jwtid: jti,
    expiresIn: refreshExpiration,
  });

  const { exp } = jwt.decode(refreshToken) as { exp: number };
  await RefreshToken.create({
    user: userId,
    jti,
    family,
    expiresAt: new Date(exp * 1000),
  });

  return { accessToken, refreshToken };
}

interface RefreshPayload extends jwt.JwtPayload {
  type: string;
  family: string;
}

/**
 * Refresh token rotation: the presented token is revoked and a new pair is
 * issued in the same family. A token that was already used (or revoked) means
 * it may have been stolen, so the whole family is revoked.
 */
export async function rotateRefreshToken(
  token: string,
): Promise<TokenPair & { userId: string }> {
  const { secret, issuer, audience } = jwtConfig();

  let payload: RefreshPayload;
  try {
    payload = jwt.verify(token, secret, { issuer, audience }) as RefreshPayload;
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  if (payload.type !== "refresh" || !payload.jti || !payload.sub) {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  // atomic: only one request can flip revokedAt for a given token
  const current = await RefreshToken.findOneAndUpdate(
    { jti: payload.jti, revokedAt: null },
    { revokedAt: new Date() },
  );

  if (!current) {
    await RefreshToken.updateMany(
      { family: payload.family, revokedAt: null },
      { revokedAt: new Date() },
    );
    throw AppError.unauthorized("Refresh token has been revoked");
  }

  const pair = await issueTokenPair(payload.sub, payload.family);
  return { ...pair, userId: payload.sub };
}
