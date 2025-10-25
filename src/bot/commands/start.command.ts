import { Telegraf, Context } from 'telegraf';
import { IBotCommand } from './base.command';

export class StartCommand implements IBotCommand {
  constructor(private bot: Telegraf) {}

  register(): void {
    this.bot.start(this.handle.bind(this));
  }

  private async handle(ctx: Context): Promise<void> {
    const username = ctx.botInfo.username;
    await ctx.reply(
      `GitHub Repository Search Bot\n\n` +
      `Bot username: <b>${username}</b>\n\n` +
      `Usage in any chat:\n` +
      `1. Type @${username} username\n` +
      `2. Or @${username} username/reponame\n\n` +
      `Examples:\n` +
      `• @${username} Microsoft\n` +
      `• @${username} microsoft/vscode`,
      { parse_mode: 'HTML' }
    );
  }
}