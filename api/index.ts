import express, { type NextFunction, type Request, type Response } from 'express';
import { accountRouter } from './routes/account.js';
import { askRouter } from './routes/ask.js';
import { transactionsRouter } from './routes/transactions.js';
import { CSV_MESSAGES } from './lib/csv.js';
import { MESSAGES } from '../src/lib/messages.js';

const app = express();

app.use(express.json({ limit: '1.5mb' }));

app.use('/api/account', accountRouter);
app.use('/api/ask', askRouter);
app.use('/api/transactions', transactionsRouter);

// JSON 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: MESSAGES.serverError });
});

// Never send raw error details to the browser or write user data to logs.
app.use((err: { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: CSV_MESSAGES.tooBig });
    return;
  }
  res.status(500).json({ error: MESSAGES.serverError });
});

export default app;
