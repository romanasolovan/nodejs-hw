import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw createHttpError(400, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw createHttpError(401, 'Invalid credentials');

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) throw createHttpError(401, 'Session not found');

    if (new Date() > session.refreshTokenValidUntil) {
      throw createHttpError(401, 'Session token expired');
    }

    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};


const TEMPLATE_PATH = new URL('../templates/reset-password-email.html', import.meta.url).pathname;

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond the same to avoid leaking existence
    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    // create token with sub and email, 15m
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // prepare template
    const templateContent = await fs.readFile(TEMPLATE_PATH, 'utf8');
    const template = handlebars.compile(templateContent);

    const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;
    const html = template({ username: user.username || user.email, link });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        html,
      });
    } catch (err) {
      console.log(err);
      throw createHttpError(500, 'Failed to send the email, please try again later.');  
    }

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw createHttpError(401, 'Invalid or expired token');
    }

    const { sub, email } = payload;

    const user = await User.findOne({ _id: sub, email });
    if (!user) throw createHttpError(404, 'User not found');

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};