import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './errorHandler';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map