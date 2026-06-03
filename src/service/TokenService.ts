import redisClient from "../config/redis";

const TOKEN_PREFIX = {
  SESSION: "session:",
  REFRESH_TOKEN: "token:refresh:",
};

export class TokenService {
  static async storeSession(
    sessionId: string,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    const key = TOKEN_PREFIX.SESSION + sessionId;
    const value = JSON.stringify({ userId, ip, userAgent, revoked: false });

    await redisClient.set(key, value, { EX: 7 * 24 * 60 * 60 });
  }

  static async storeRefreshToken(
    refreshToken: string,
    userId: string,
    sessionId: string,
  ) {
    const key = TOKEN_PREFIX.REFRESH_TOKEN + refreshToken;
    const value = JSON.stringify({
      userId,
      sessionId,
      revoked: false,
      createdAt: new Date().toISOString(),
    });

    await redisClient.set(key, value, {
      EX: 7 * 24 * 60 * 60,
    });
  }

  static async getRefreshToken(refreshToken: string) {
    const key = TOKEN_PREFIX.REFRESH_TOKEN + refreshToken;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async getSession(sessionId: string) {
    const key = TOKEN_PREFIX.SESSION + sessionId;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async revokeRefreshToken(refreshTokenHash: string) {
    const key = TOKEN_PREFIX.REFRESH_TOKEN + refreshTokenHash;
    return await redisClient.del(key);
  }

  static async revokeSession(sessionId: string) {
    const key = TOKEN_PREFIX.SESSION + sessionId;
    return await redisClient.del(key);
  }
}
