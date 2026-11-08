import { Router } from 'express';
import { requireUser } from '../middleware/requireUser.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { MESSAGES } from '../../src/lib/messages.js';

export const accountRouter = Router();

// OP7: deleting the Auth user cascades to every row. The id only ever comes from the checked token (SEC3).
accountRouter.delete('/', requireUser, async (_req, res) => {
  const { error } = await supabaseAdmin().auth.admin.deleteUser(res.locals.userId);
  if (error) {
    res.status(500).json({ error: MESSAGES.accountDeleteFailed });
    return;
  }
  res.status(204).end();
});
