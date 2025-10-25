import { Telegraf } from 'telegraf';

export interface IBotCommand {
  register(): void;
}