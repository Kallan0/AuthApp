import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail = error instanceof HttpException ? error.getResponse() : null;
    const message = typeof detail === 'string' ? detail : detail && typeof detail === 'object' && 'message' in detail
      ? (Array.isArray(detail.message) ? detail.message.join('; ') : String(detail.message))
      : 'Something went wrong';
    const code = status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : status === 400 ? 'VALIDATION_ERROR' : status === 429 ? 'RATE_LIMITED' : 'SERVER_ERROR';
    response.status(status).json({ success: false, message, code });
  }
}
