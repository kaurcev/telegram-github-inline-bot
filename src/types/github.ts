export interface GitHubRepository {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string | null;
  owner: {
    avatar_url: string;
    login: string;
  };
  updated_at: string;
  created_at: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}