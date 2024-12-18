import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  private static readonly colors = {
    log: '\x1b[37m', // White
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    debug: '\x1b[34m', // Blue
    verbose: '\x1b[36m', // Cyan
    reset: '\x1b[0m', // Reset to default
  };

  log(message: string, context?: string) {
    super.log(
      `${CustomLogger.colors.log}${message}${CustomLogger.colors.reset}`,
      context,
    );
  }

  error(message: string, trace?: string, context?: string) {
    super.error(
      `${CustomLogger.colors.error}${message}${CustomLogger.colors.reset}`,
      trace,
      context,
    );
  }

  warn(message: string, context?: string) {
    super.warn(
      `${CustomLogger.colors.warn}${message}${CustomLogger.colors.reset}`,
      context,
    );
  }

  debug(message: string, context?: string) {
    super.debug(
      `${CustomLogger.colors.debug}${message}${CustomLogger.colors.reset}`,
      context,
    );
  }

  verbose(message: string, context?: string) {
    super.verbose(
      `${CustomLogger.colors.verbose}${message}${CustomLogger.colors.reset}`,
      context,
    );
  }
}
