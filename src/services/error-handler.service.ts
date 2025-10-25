import { AxiosError } from 'axios';

export enum ErrorType {
  TIMEOUT = 'ECONNABORTED',
  RATE_LIMIT = 403,
  NOT_FOUND = 404,
  VALIDATION_FAILED = 422,
}

export class ErrorHandlerService {
  handle(error: unknown): string {
    if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
      return error.message.replace('RATE_LIMIT: ', '');
    }

    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    return 'Unknown error';
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  private handleAxiosError(error: AxiosError): string {
    if (error.code === ErrorType.TIMEOUT) {
      return 'GitHub request timeout';
    }

    if (error.response?.status === ErrorType.RATE_LIMIT) {
      return 'GitHub API rate limit exceeded. Please try again later.';
    }

    if (error.response?.status === ErrorType.NOT_FOUND) {
      return 'Repository not found';
    }

    if (error.response?.status === ErrorType.VALIDATION_FAILED) {
      return 'Invalid search query';
    }

    return 'GitHub search error';
  }

  private handleGenericError(error: Error): string {
    return `Error: ${error.message}`;
  }
}