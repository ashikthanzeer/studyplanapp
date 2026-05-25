export declare function hashPassword(password: string): Promise<string>;
export declare function comparePasswords(password: string, hash: string): Promise<boolean>;
export declare function generateToken(id: number, email: string): string;
export declare function isValidEmail(email: string): boolean;
//# sourceMappingURL=auth.d.ts.map