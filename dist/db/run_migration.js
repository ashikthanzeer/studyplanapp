"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function run() {
    try {
        const sqlPath = path_1.default.join(__dirname, 'migration_remove_kanban.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        console.log('Executing SQL migration script...');
        await (0, connection_1.query)(sql);
        console.log('Migration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        await (0, connection_1.closePool)();
    }
}
run();
//# sourceMappingURL=run_migration.js.map