import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark resource(Controller/Endpoint) as public accessible
 * @returns
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
