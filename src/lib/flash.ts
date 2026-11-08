let message: string | null = null;

/** Holds one Toast across a redirect, for screens the route guards reach on their own. */
export function setFlash(text: string) {
  message = text;
}

export function takeFlash(): string | null {
  const text = message;
  message = null;
  return text;
}
