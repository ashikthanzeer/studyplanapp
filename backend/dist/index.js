"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const profile_1 = __importDefault(require("./routes/profile"));
const subjects_1 = __importDefault(require("./routes/subjects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const pomodoro_1 = __importDefault(require("./routes/pomodoro"));
const kanban_1 = __importDefault(require("./routes/kanban"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Study Planner API is running' });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/subjects', subjects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/pomodoro', pomodoro_1.default);
app.use('/api/kanban', kanban_1.default);
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Study Planner API listening on port ${port}`);
});
//# sourceMappingURL=index.js.map