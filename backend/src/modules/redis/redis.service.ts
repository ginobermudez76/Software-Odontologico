import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', 'redis_secure_password');

    this.client = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.client.on('connect', () => {
      this.logger.log(`Conexión establecida con Redis en ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error(`Error en cliente Redis: ${err.message}`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async setSession(userId: string, sessionId: string, data: any, ttlSeconds: number = 900): Promise<void> {
    const key = `session:active:${userId}:${sessionId}`;
    await this.client.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async refreshSessionActivity(userId: string, sessionId: string, ttlSeconds: number = 900): Promise<boolean> {
    const key = `session:active:${userId}:${sessionId}`;
    const exists = await this.client.exists(key);
    if (exists) {
      await this.client.expire(key, ttlSeconds);
      return true;
    }
    return false;
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:active:${userId}:${sessionId}`;
    await this.client.del(key);
  }

  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    const key = `blacklist:token:${jti}`;
    await this.client.setex(key, ttlSeconds, 'revoked');
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = `blacklist:token:${jti}`;
    const result = await this.client.exists(key);
    return result === 1;
  }
}

