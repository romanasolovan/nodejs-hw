import express from 'express';
import { celebrate } from 'celebrate';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', celebrate({ body: registerUserSchema }), registerUser);
authRouter.post('/login', celebrate({ body: loginUserSchema }), loginUser);
authRouter.post('/refresh', refreshUserSession);
authRouter.post('/logout', logoutUser);
authRouter.post('/request-reset-email', celebrate({body: requestResetEmailSchema}), requestResetEmail);
authRouter.post('/reset-password', celebrate({ body: resetPasswordSchema }), resetPassword);