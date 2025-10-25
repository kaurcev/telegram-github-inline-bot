import { EnvironmentConfig } from './config/env';
import { GitHubService } from './services/github.service';
import { QueryParserService } from './services/query-parser.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { TelegramBot } from './bot/telegram.bot';
import { ConsoleLogger } from './logger/console.logger';

export class Application {
  private logger: ConsoleLogger;

  constructor() {
    this.logger = new ConsoleLogger();
  }

  async bootstrap(): Promise<void> {
    try {
      const config = EnvironmentConfig.getInstance();
      const token = config.getBotToken();

      this.logger.info('Bot starting...');

      const githubService = new GitHubService();
      const queryParser = new QueryParserService();
      const responseBuilder = new ResponseBuilderService();
      const errorHandler = new ErrorHandlerService();

      const bot = new TelegramBot(
        token,
        githubService,
        queryParser,
        responseBuilder,
        errorHandler
      );

      bot.initialize();

      this.setupGracefulShutdown(bot);
      await bot.launch();

      this.logger.info('Bot started successfully');

    } catch (error) {
      this.logger.error('Application startup error:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(bot: TelegramBot): void {
    process.once('SIGINT', () => {
      this.logger.info('SIGINT received. Stopping bot...');
      bot.stop('SIGINT');
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      this.logger.info('SIGTERM received. Stopping bot...');
      bot.stop('SIGTERM');
      process.exit(0);
    });
  }
}