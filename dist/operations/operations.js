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
exports.getResponse = exports.postResponse = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;
const postResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, type, content, star } = req.body;
    try {
        const checkUser = yield prisma.user.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!checkUser) {
            res.status(403).json({ error: "Invalid user id" });
        }
        const responseData = yield prisma.response.create({
            data: { userId, type, content, star },
        });
        const addResponsetoUserTable = yield prisma.user.update({
            where: {
                userId: userId,
            },
            data: {
                responses: {
                    // Append the newly created response to the existing responses array
                    // Use 'connect' to establish a relationship between user and response
                    connect: { responseId: responseData.responseId },
                },
            },
        });
        res
            .status(201)
            .json({ message: "Response created successfully", responseData });
    }
    catch (error) {
        console.error("Error creating response:", error);
        res.status(500).json({ error: "Failed to create response" });
    }
});
exports.postResponse = postResponse;
const getResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log(userId);
    try {
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const responses = yield prisma.response.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).json({ responses });
    }
    catch (error) {
        console.error("Error fetching response:", error);
        res.status(500).json({ error: "Failed to fetch response" });
    }
});
exports.getResponse = getResponse;
