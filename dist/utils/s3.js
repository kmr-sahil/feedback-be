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
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = __importDefault(require("../config"));
const s3 = new client_s3_1.S3Client({
    region: config_1.default.AWS.Region,
    credentials: {
        accessKeyId: config_1.default.AWS.AccessKeyId,
        secretAccessKey: config_1.default.AWS.AWSSecretKey
    }
});
const BUCKET_NAME = config_1.default.AWS.BucketName;
function createPresignedPost({ key, contentType }) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(BUCKET_NAME, " --- ", key, " --- ", contentType);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });
        const fileLink = `https://${BUCKET_NAME}.s3.${config_1.default.AWS.Region}.amazonaws.com/${key}`;
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, {
            expiresIn: 5 * 60, // 5 minutes - default is 15 mins
        });
        return { fileLink, signedUrl };
    });
}
exports.default = createPresignedPost;
