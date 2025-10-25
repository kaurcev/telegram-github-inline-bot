import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { IGitHubService } from '../services/github.service';
import { QueryParserService, QueryParseResult } from '../services/query-parser.service';
import { ResponseBuilderService } from '../services/response-builder.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { CustomInlineQueryResult } from '../types/telegram';
import { StartCommand } from './commands/start.command';
import { TestCommand } from './commands/test.command';

interface IBotCommand {
  register(): void;
}

export class TelegramBot {
  private bot: Telegraf;
  private githubService: IGitHubService;
  private queryParser: QueryParserService;
  private responseBuilder: ResponseBuilderService;
  private errorHandler: ErrorHandlerService;

  constructor(
    token: string,
    githubService: IGitHubService,
    queryParser: QueryParserService,
    responseBuilder: ResponseBuilderService,
    errorHandler: ErrorHandlerService
  ) {
    this.bot = new Telegraf(token);
    this.githubService = githubService;
    this.queryParser = queryParser;
    this.responseBuilder = responseBuilder;
    this.errorHandler = errorHandler;
  }

  initialize(): void {
    this.registerHandlers();
    this.registerCommands();
  }

  private registerHandlers(): void {
    this.bot.on('inline_query', this.handleInlineQuery.bind(this));
  }

  private registerCommands(): void {
    const commands: IBotCommand[] = [
      new StartCommand(this.bot),
      new TestCommand(this.bot),
    ];

    commands.forEach(command => command.register());
  }

  private async handleInlineQuery(ctx: Context<Update.InlineQueryUpdate>): Promise<void> {
    if (!ctx.inlineQuery) return;

    const query = ctx.inlineQuery.query;
    console.log(`Inline query: ${query}`);

    const parseResult = this.queryParser.parse(query);

    if (!parseResult.isValid) {
      await ctx.answerInlineQuery([], {
        button: {
          text: 'Enter username/repo to search',
          start_parameter: 'help'
        }
      });
      return;
    }

    try {
      let repositories: any[] = [];

      if (parseResult.searchType === 'exact' && parseResult.owner && parseResult.repo) {
        const repo = await this.githubService.getRepository(parseResult.owner, parseResult.repo);
        if (repo) {
          repositories = [repo];
        } else {
          repositories = await this.githubService.searchRepositories(parseResult.searchQuery);
        }
      } else if (parseResult.searchType === 'repo') {
        repositories = await this.githubService.searchRepositories(parseResult.searchQuery);
      } else {
        const username = query.trim();
        repositories = await this.githubService.getUserRepositories(username);
      }

      console.log(`Found: ${repositories.length} repositories`);

      if (repositories.length === 0) {
        await ctx.answerInlineQuery([], {
          button: {
            text: 'No repositories found',
            start_parameter: 'not_found'
          }
        });
        return;
      }

      const results = this.responseBuilder.buildRepositoryResults(repositories);
      await ctx.answerInlineQuery(results as any);

    } catch (error) {
      console.error(`Search error: ${error}`);
      const errorMessage = this.errorHandler.handle(error);
      
      await ctx.answerInlineQuery([], {
        button: {
          text: errorMessage,
          start_parameter: 'error'
        }
      });
    }
  }

  launch(): Promise<void> {
    return this.bot.launch();
  }

  stop(signal: string): void {
    this.bot.stop(signal);
  }
}