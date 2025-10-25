import { config } from 'dotenv';

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  private constructor() {
    config();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  getBotToken(): string {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      throw new Error('BOT_TOKEN is not defined in environment variables');
    }
    return token;
  }

  getGitHubToken(): string | undefined {
    return process.env.GITHUB_TOKEN;
  }
}