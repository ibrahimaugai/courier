import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'string' ? message : message,
    };

    // Log error details to console
    if (status >= 500) {
      // Server errors - log full details
      this.logger.error(
        `❌ ${request.method} ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
      this.logger.error('Request body:', JSON.stringify(request.body, null, 2));
      this.logger.error('Request query:', JSON.stringify(request.query, null, 2));
      this.logger.error('Request params:', JSON.stringify(request.params, null, 2));
    } else {
      // Client errors - log summary
      this.logger.warn(
        `⚠️ ${request.method} ${request.url} - Status: ${status} - ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
