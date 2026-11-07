import { randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { RefreshToken } from "@/models/refresh-token-entity.js";

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
