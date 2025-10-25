import { EnvironmentConfig } from './config/env';
import { GitHubService } from './services/github.service';
import { QueryParserService } from './services/query-parser.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { TelegramBot } from './bot/telegram.bot';
import { ConsoleLogger } from './logger/console.logger';
import { WebServer } from './web-server';

export class Application {
  private logger: ConsoleLogger;
  private webServer: WebServer;

  constructor() {
    this.logger = new ConsoleLogger();
    this.webServer = new WebServer(process.env.PORT ? parseInt(process.env.PORT) : 8080);
  }

  async bootstrap(): Promise<void> {
    try {
      const config = EnvironmentConfig.getInstance();
      const token = config.getBotToken();
      const githubToken = config.getGitHubToken();
      
      this.logger.info('Application starting...');

      if (!githubToken) {
        this.logger.warn('GITHUB_TOKEN not provided. Using unauthenticated requests with lower rate limits.');
      } else {
        this.logger.info('GitHub token provided. Using authenticated requests.');
      }

      this.webServer.start();

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
      this.logger.info('Application is fully operational');

    } catch (error) {
      this.logger.error('Application startup error:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(bot: TelegramBot): void {
    process.once('SIGINT', () => {
      this.logger.info('SIGINT received. Stopping application...');
      bot.stop('SIGINT');
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      this.logger.info('SIGTERM received. Stopping application...');
      bot.stop('SIGTERM');
      process.exit(0);
    });
  }
}