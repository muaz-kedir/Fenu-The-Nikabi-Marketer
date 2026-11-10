import type { IncomingMessage, ServerResponse } from 'node:http';

declare const app: (
  request: IncomingMessage,
  response: ServerResponse,
  next: (error?: Error) => void,
) => void;

export default app;
