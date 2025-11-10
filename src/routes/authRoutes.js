import express from 'express';
import { celebrate } from 'celebrate';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', celebrate({ body: registerUserSchema }), registerUser);
authRouter.post('/login', celebrate({ body: loginUserSchema }), loginUser);
authRouter.post('/refresh', refreshUserSession);
authRouter.post('/logout', logoutUser);
