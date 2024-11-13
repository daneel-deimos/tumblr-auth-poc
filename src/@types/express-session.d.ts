import 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauthToken?: string;
    oauthTokenSecret?: string;
  }
}
