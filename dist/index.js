"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/todos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, isCompleted } = req.body;
    const todo = yield client.todo.create({
        data: {
            content,
            isCompleted
        }
    });
    res.json({ todo });
}));
app.get("/todos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todos = yield client.todo.findMany();
    res.json({ todos });
}));
app.put("/todos/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isCompleted } = req.body;
    const todo = yield client.todo.update({
        where: {
            id: parseInt(req.params.id)
        },
        data: {
            isCompleted
        }
    });
    res.json({ todo });
}));
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    const passwordHash = yield bcrypt_1.default.hash(password, 10);
    const user = yield client.user.create({
        data: {
            firstName,
            lastName,
            email,
            passwordHash,
            sessions: {
                create: [{
                        token: (0, uuid_1.v4)()
                    }]
            }
        },
        include: {
            sessions: true
        }
    });
    res.cookie("session-token", user.sessions[0].token, {
        httpOnly: true
    });
}));
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
