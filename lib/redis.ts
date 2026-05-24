import { randomUUID } from "crypto";

import Redis from "ioredis";

import { ConflictAppError } from "@/lib/errors";
import { sleep } from "@/utils/sleep";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("Missing REDIS_URL environment variable.");
}

declare global {
  var redisClient: Redis | undefined;
}

const redis =
  global.redisClient ??
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true
  });

global.redisClient = redis;

const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
`;

export interface AcquireLockOptions {
  ttlSeconds?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

export async function getRedisClient() {
  if (redis.status !== "ready" && redis.status !== "connecting") {
    await redis.connect();
  }

  return redis;
}

export async function acquireLock(
  key: string,
  options: AcquireLockOptions = {}
) {
  const client = await getRedisClient();
  const token = randomUUID();
  const ttlSeconds = options.ttlSeconds ?? 10;
  const retryCount = options.retryCount ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 150;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const acquired = await client.set(key, token, "EX", ttlSeconds, "NX");

    if (acquired === "OK") {
      return { key, token };
    }

    if (attempt < retryCount) {
      await sleep(retryDelayMs);
    }
  }

  throw new ConflictAppError("Inventory is currently being updated. Please retry.");
}

export async function releaseLock(key: string, token: string) {
  const client = await getRedisClient();
  await client.eval(RELEASE_LOCK_SCRIPT, 1, key, token);
}
