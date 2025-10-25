import { InlineQueryResultArticle } from 'telegraf/types';

export type CustomInlineQueryResult = InlineQueryResultArticle & {
  description?: string;
  thumb_url?: string;
};