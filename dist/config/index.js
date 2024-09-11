"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: '.env.local'
});
const config = {
    PORT: parseInt(process.env.PORT || '3010', 10),
    AWS: {
        AccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        AWSSecretKey: process.env.AWS_SECRET_KEY || '',
        BucketName: process.env.AWS_S3_BUCKET_NAME || '',
        Region: 'ap-south-1',
    }
};
exports.default = config;
