import { MESSAGES } from '../messages.js';

export const DAILY_QUESTION_LIMIT = 20;
export const MAX_QUESTION_LENGTH = 500;
export const QUESTION_TOO_LONG = MESSAGES.questionTooLong;
export const LIMIT_REACHED = MESSAGES.askLimitReached;

export function validateQuestion(question: string): string | null {
  return question.length > MAX_QUESTION_LENGTH ? QUESTION_TOO_LONG : null;
}

/** BR15: a count from an earlier SAST date counts as 0. */
export function questionsLeft(askCount: number, askCountDate: string | null, today: string): number {
  return DAILY_QUESTION_LIMIT - (askCountDate === today ? askCount : 0);
}
