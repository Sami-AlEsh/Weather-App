import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AppLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { ip, method, baseUrl } = request;
    const userAgent = request.get('user-agent') ?? 'UNKNOWN';

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `> ${method}: ${baseUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} ${responseTime}ms`,
      );
    });

    next();
  }
}
