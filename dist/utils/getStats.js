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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getResponseStats(projectId) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const responseStats = yield prisma.response.groupBy({
            by: ['type'],
            where: {
                projectId: projectId,
            },
            _count: {
                _all: true, // Count total responses
            },
        });
        console.log(responseStats);
        // Calculate total responses
        const totalResponses = responseStats.reduce((acc, stat) => acc + stat._count._all, 0);
        // Extract counts for specific types
        const suggestionCount = ((_a = responseStats.find(stat => stat.type === 'Suggestion')) === null || _a === void 0 ? void 0 : _a._count._all) || 0;
        const issueCount = ((_b = responseStats.find(stat => stat.type === 'Issue')) === null || _b === void 0 ? void 0 : _b._count._all) || 0;
        const likedCount = ((_c = responseStats.find(stat => stat.type === 'Liked')) === null || _c === void 0 ? void 0 : _c._count._all) || 0;
        return {
            totalResponses,
            suggestionCount,
            issueCount,
            likedCount,
        };
    });
}
exports.default = getResponseStats;
