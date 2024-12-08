import { verifyUserWithToken } from "./auth/middleware";

import express from 'express';
import authRoute from './auth/auth';
import projectRoute from './project/route'
import reviewRoute from './review/route'
import helper from './helper/route'
import companyRoute from './company/route'
import userRoute from './user/route'

const router = express.Router();


router.use('/auth', authRoute);
router.use('/project', projectRoute);
router.use('/responses', reviewRoute);
router.use('/company', companyRoute);
router.use('/user', userRoute)
router.use('/helper', helper);

export default router;