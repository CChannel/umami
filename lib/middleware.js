import { createMiddleware, unauthorized, badRequest, serverError } from 'next-basics';
import cors from 'cors';
import { getSession } from './session';
import { getAuthToken } from './auth';
import { setCookie } from 'cookies-next';

export const useCors = createMiddleware(cors());

export const useSession = createMiddleware(async (req, res, next) => {
  let session;

  try {
    session = await getSession(req);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return serverError(res, e.message);
  }

  if (!session) {
    return badRequest(res);
  }

  setCookie('lemon_session_uuid', session.session_uuid, {
    req,
    res,
    maxAge: 60 * 60 * 24 * 365, // Expires after 1 year
    // sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production',
  });

  req.session = session;
  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = await getAuthToken(req);

  if (!token) {
    return unauthorized(res);
  }

  req.auth = token;
  next();
});
