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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Router = exports.getResponse = exports.postResponse = exports.getProjects = exports.updateProjects = exports.getProject = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const s3_1 = __importDefault(require("../utils/s3"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;
// Endpoint to create a new project
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { logoUrl, name, description } = req.body;
    const userId = req.userId; // Assuming you're setting this in your auth middleware
    if (!userId) {
        return res.status(403).json({ error: "User not authenticated" });
    }
    try {
        const checkUser = yield prisma.user.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!checkUser) {
            return res.status(403).json({ error: "Invalid user id" });
        }
        const projectId = (0, uuid_1.v4)();
        const projectData = yield prisma.project.create({
            data: { projectId, userId, name, description, logoUrl },
        });
        res
            .status(201)
            .json({ message: "Project created successfully", projectData });
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
});
exports.createProject = createProject;
const getProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.query.projectId;
        // Ensure the project exists
        const projectDetails = yield prisma.project.findUnique({
            where: {
                projectId: projectId,
            },
        });
        if (!projectDetails) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json({ project: projectDetails });
    }
    catch (error) {
        console.error("Error retireving project:", error);
        res.status(500).json({ error: "Failed to retrieve project" });
    }
});
exports.getProject = getProject;
const updateProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { projectId } = _a, updateData = __rest(_a, ["projectId"]); // Destructure projectId and other fields to update
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ error: "User not authenticated" });
        }
        // Ensure the project exists
        const existingProject = yield prisma.project.findUnique({
            where: {
                projectId: projectId,
            },
        });
        if (!existingProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        // Update the project with the data sent in the request
        const updatedProject = yield prisma.project.update({
            where: {
                projectId: projectId,
            },
            data: updateData, // This updates only the fields that are provided
        });
        res.status(200).json({ project: updatedProject });
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
    }
});
exports.updateProjects = updateProjects;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ error: "User not authenticated" });
        }
        const projects = yield prisma.project.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).json({ projects });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});
exports.getProjects = getProjects;
// Endpoint to create a new response
const postResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, projectId, type, content, star } = req.body;
    try {
        const checkProject = yield prisma.project.findUnique({
            where: {
                projectId: projectId,
            },
        });
        if (!checkProject) {
            return res.status(403).json({ error: "Invalid project id" });
        }
        const responseData = yield prisma.response.create({
            data: { name, email, projectId, type, content, star },
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
// Endpoint to get responses for a project
const getResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectIdParam = req.query.projectId;
    //console.log(projectIdParam);
    try {
        if (!projectIdParam || typeof projectIdParam !== "string") {
            return res.status(400).json({ error: "Valid Project ID is required" });
        }
        const projectId = projectIdParam;
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }
        const responses = yield prisma.response.findMany({
            where: {
                projectId: projectId,
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
const s3Router = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { content_type } = req.body;
        const key = (0, uuid_1.v4)();
        const data = yield (0, s3_1.default)({ key, contentType: content_type });
        return res.send({
            status: "success",
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({
            status: "error",
            message: err.message,
        });
    }
});
exports.s3Router = s3Router;
