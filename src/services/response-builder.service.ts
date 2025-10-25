import { GitHubRepository } from '../types/github';
import { CustomInlineQueryResult } from '../types/telegram';

export class ResponseBuilderService {
  buildRepositoryResults(repositories: GitHubRepository[]): CustomInlineQueryResult[] {
    return repositories.slice(0, 10).map((repo, index) => {
      const description = repo.description 
        ? this.escapeHtml(repo.description).substring(0, 100) + (repo.description.length > 100 ? '...' : '')
        : 'No description';

      return {
        type: 'article',
        id: index.toString(),
        title: this.escapeHtml(repo.full_name),
        description: description,
        thumb_url: repo.owner.avatar_url,
        input_message_content: {
          message_text: this.buildMessageText(repo),
          parse_mode: 'HTML',
        },
      };
    });
  }

  private buildMessageText(repo: GitHubRepository): string {
    const escapedName = this.escapeHtml(repo.full_name);
    const escapedDescription = this.escapeHtml(repo.description || 'No description');
    const escapedUrl = this.escapeHtml(repo.html_url);

    let message = `<b>${escapedName}</b>\n`;
    message += `Stars: ${repo.stargazers_count}\n`;
    message += `Forks: ${repo.forks_count}\n`;
    
    if (repo.language) {
      message += `Language: ${this.escapeHtml(repo.language)}\n`;
    }
    
    if (repo.updated_at) {
      const updatedDate = new Date(repo.updated_at).toLocaleDateString();
      message += `Updated: ${updatedDate}\n`;
    }
    
    message += `${escapedDescription}\n`;
    message += `<a href="${escapedUrl}">Open repository</a>`;

    return message;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/<(\/)?(kbd|code|pre|span|div|script|style|h[1-6])[^>]*>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}