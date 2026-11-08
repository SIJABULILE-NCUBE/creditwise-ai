import type { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { MESSAGES } from '../../src/lib/messages.js';

/** Checks the Supabase login token on a route. The user's id is then in res.locals.userId. */
export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) {
    res.status(401).json({ error: MESSAGES.loggedOut });
    return;
  }
  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: MESSAGES.loggedOut });
    return;
  }
  res.locals.userId = data.user.id;
  next();
}
