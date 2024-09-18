"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth/auth");
const middleware_1 = require("./auth/middleware");
const operations_1 = require("./operations/operations");
dotenv_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:3000",
}));
app.use((0, cookie_parser_1.default)());
app.post("/v1/auth/signup", auth_1.signup);
app.post("/v1/auth/signin", auth_1.signin);
app.use("/v1/verifyuserwithtoken", middleware_1.verifyUserWithToken, (req, res) => {
    res.send("User is verified");
});
app.post("/v1/project", middleware_1.verifyUserWithToken, operations_1.createProject);
app.get("/v1/project", operations_1.getProject);
app.put("/v1/project", middleware_1.verifyUserWithToken, operations_1.updateProjects);
app.get("/v1/projects", middleware_1.verifyUserWithToken, operations_1.getProjects);
app.post("/v1/responses", operations_1.postResponse);
app.get("/v1/responses", operations_1.getResponse);
app.get("/v1/sureefy", operations_1.getSingleResponse);
app.post('/v1/s3/signed_url', operations_1.s3Router);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
