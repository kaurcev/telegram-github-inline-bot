import { Telegraf, Context } from 'telegraf';
import { IBotCommand } from './base.command';

export class TestCommand implements IBotCommand {
  constructor(private bot: Telegraf) {}

  register(): void {
    this.bot.command('test', this.handle.bind(this));
  }

  private async handle(ctx: Context): Promise<void> {
    await ctx.reply('Bot is working! Try inline mode: @' + ctx.botInfo.username + ' Microsoft');
  }
}