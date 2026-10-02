import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData { id: string; name: string; email: string }
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): CurrentUserData => context.switchToHttp().getRequest<{ user: CurrentUserData }>().user);
