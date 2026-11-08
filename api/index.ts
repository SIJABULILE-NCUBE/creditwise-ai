import express, { type NextFunction, type Request, type Response } from 'express';
import { accountRouter } from './routes/account.js';
import { MESSAGES } from '../src/lib/messages.js';

const app = express();

app.use(express.json({ limit: '1.5mb' }));

app.use('/api/account', accountRouter);

// JSON 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Never send raw error details to the browser or write user data to logs.
app.use((_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: MESSAGES.serverError });
});

export default app;
