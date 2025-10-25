import axios, { AxiosInstance } from 'axios';
import { GitHubRepository, GitHubSearchResponse } from '../types/github';
import { EnvironmentConfig } from '../config/env';

export interface IGitHubService {
  searchRepositories(query: string): Promise<GitHubRepository[]>;
  getUserRepositories(username: string): Promise<GitHubRepository[]>;
  getRepository(owner: string, repo: string): Promise<GitHubRepository | null>;
  getRateLimit(): Promise<any>;
}

export class GitHubService implements IGitHubService {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private rateLimitRemaining: number = 60;
  private rateLimitReset: number = 0;

  constructor() {
    const config = EnvironmentConfig.getInstance();
    const githubToken = config.getGitHubToken();

    const headers: any = {
      'User-Agent': 'Telegram-GitHub-Bot',
      Accept: 'application/vnd.github.v3+json',
    };

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 10000,
      headers,
    });

    this.setupRateLimitMonitoring();
  }

  private getCacheKey(method: string, key: string): string {
    return `${method}:${key}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.CACHE_TTL) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  private updateRateLimit(headers: any): void {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining']);
    }
    if (headers['x-ratelimit-reset']) {
      this.rateLimitReset = parseInt(headers['x-ratelimit-reset']) * 1000;
    }
  }

  private canMakeRequest(): boolean {
    return this.rateLimitRemaining > 5; // Reserve 5 requests for critical operations
  }

  private getTimeUntilReset(): string {
    const now = Date.now();
    const diff = this.rateLimitReset - now;
    if (diff <= 0) return 'soon';
    
    const minutes = Math.ceil(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  private setupRateLimitMonitoring(): void {
    setInterval(() => {
      if (this.rateLimitRemaining < 10) {
        console.warn(`GitHub API rate limit low: ${this.rateLimitRemaining} remaining. Resets in ${this.getTimeUntilReset()}`);
      }
    }, 60000); // Check every minute
  }

  async searchRepositories(query: string): Promise<GitHubRepository[]> {
    if (!this.canMakeRequest()) {
      throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
    }

    const cacheKey = this.getCacheKey('search', query);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubSearchResponse>(
        `/search/repositories?q=${encodeURIComponent(query)}&per_page=10&sort=updated`
      );
      
      this.updateRateLimit(response.headers);
      this.setCache(cacheKey, response.data.items);
      return response.data.items;
    } catch (error: any) {
      if (error.response?.status === 422) {
        return [];
      }
      if (error.response?.status === 403) {
        this.updateRateLimit(error.response.headers);
        throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
      }
      throw error;
    }
  }

  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    if (!this.canMakeRequest()) {
      throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
    }

    const cacheKey = this.getCacheKey('user', username);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubRepository[]>(
        `/users/${encodeURIComponent(username)}/repos?per_page=10&sort=updated`
      );
      
      this.updateRateLimit(response.headers);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      if (error.response?.status === 403) {
        this.updateRateLimit(error.response.headers);
        throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
      }
      throw error;
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    if (!this.canMakeRequest()) {
      throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
    }

    const cacheKey = this.getCacheKey('repo', `${owner}/${repo}`);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubRepository>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );
      
      this.updateRateLimit(response.headers);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.status === 403) {
        this.updateRateLimit(error.response.headers);
        throw new Error(`RATE_LIMIT: GitHub API rate limit exceeded. Resets in ${this.getTimeUntilReset()}`);
      }
      throw error;
    }
  }

  async getRateLimit(): Promise<any> {
    try {
      const response = await this.client.get('/rate_limit');
      return response.data;
    } catch (error) {
      console.error('Failed to get rate limit info:', error);
      return null;
    }
  }
}