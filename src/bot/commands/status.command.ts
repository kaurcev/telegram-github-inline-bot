import { Telegraf, Context } from 'telegraf';
import { IBotCommand } from './base.command';
import { IGitHubService } from '../../services/github.service';

export class StatusCommand implements IBotCommand {
  constructor(
    private bot: Telegraf,
    private githubService: IGitHubService
  ) {}

  register(): void {
    this.bot.command('status', this.handle.bind(this));
  }

  private async handle(ctx: Context): Promise<void> {
    try {
      const rateLimit = await this.githubService.getRateLimit();
      
      if (!rateLimit) {
        await ctx.reply('Unable to fetch rate limit status');
        return;
      }

      const core = rateLimit.resources.core;
      const remaining = core.remaining;
      const limit = core.limit;
      const resetTime = new Date(core.reset * 1000).toLocaleTimeString();
      
      const message = `GitHub API Status:\n\n` +
        `Remaining requests: ${remaining}/${limit}\n` +
        `Reset time: ${resetTime}\n\n` +
        `Usage: ${Math.round((1 - remaining / limit) * 100)}%`;

      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('Error fetching GitHub API status');
    }
  }
}