import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/errorHandler';
export declare function getColumns(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createColumn(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateColumn(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteColumn(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function moveTaskToColumn(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getColumnTasks(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=kanbanController.d.ts.map