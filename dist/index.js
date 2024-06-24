"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./auth/auth");
const middleware_1 = require("./auth/middleware");
dotenv_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.post("/v1/auth/signup", auth_1.signup);
app.post("/v1/auth/signin", auth_1.signin);
app.use("/v1/verifyuserwithtoken", middleware_1.verifyUserWithToken, (req, res) => {
    res.send("User is verified");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
