import axios, { AxiosInstance } from 'axios';
import { GitHubRepository, GitHubSearchResponse } from '../types/github';

export interface IGitHubService {
  searchRepositories(query: string): Promise<GitHubRepository[]>;
  getUserRepositories(username: string): Promise<GitHubRepository[]>;
  getRepository(owner: string, repo: string): Promise<GitHubRepository | null>;
}

export class GitHubService implements IGitHubService {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 10000,
      headers: {
        'User-Agent': 'Telegram-GitHub-Bot',
        Accept: 'application/vnd.github.v3+json',
      },
    });
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

  async searchRepositories(query: string): Promise<GitHubRepository[]> {
    const cacheKey = this.getCacheKey('search', query);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubSearchResponse>(
        `/search/repositories?q=${encodeURIComponent(query)}&per_page=10&sort=updated`
      );
      
      this.setCache(cacheKey, response.data.items);
      return response.data.items;
    } catch (error: any) {
      if (error.response?.status === 422) {
        return [];
      }
      throw error;
    }
  }

  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    const cacheKey = this.getCacheKey('user', username);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubRepository[]>(
        `/users/${encodeURIComponent(username)}/repos?per_page=10&sort=updated`
      );
      
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    const cacheKey = this.getCacheKey('repo', `${owner}/${repo}`);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get<GitHubRepository>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );
      
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}