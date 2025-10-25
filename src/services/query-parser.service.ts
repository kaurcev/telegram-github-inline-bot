export interface QueryParseResult {
  searchQuery: string;
  isValid: boolean;
  searchType: 'user' | 'repo' | 'exact';
  owner?: string;
  repo?: string;
}

export class QueryParserService {
  parse(query: string): QueryParseResult {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return { searchQuery: '', isValid: false, searchType: 'user' };
    }

    const cleanQuery = trimmedQuery.replace(/\s+/g, ' ').replace(/\/+/g, '/').replace(/\s*\//g, '/').replace(/\/\s*/g, '/');
    
    if (cleanQuery.includes('/')) {
      const parts = cleanQuery.split('/').filter(part => part.length > 0);
      
      if (parts.length >= 2) {
        const username = parts[0];
        const repoName = parts.slice(1).join('/');

        if (username && repoName) {
          return {
            searchQuery: `${repoName} user:${username}`,
            isValid: true,
            searchType: 'exact',
            owner: username,
            repo: repoName
          };
        }
      }
      
      return { searchQuery: '', isValid: false, searchType: 'user' };
    }

    return {
      searchQuery: `user:${cleanQuery}`,
      isValid: true,
      searchType: 'user'
    };
  }
}