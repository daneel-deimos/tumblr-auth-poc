import express, { Request, Response } from 'express';
import session from 'express-session';
import { OAuth } from 'oauth';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import tumblr from 'tumblr.js';

dotenv.config();
import config from './config';

const consumerKey = config.tumblrConsumerKey;
const consumerSecret = config.tumblrConsumerSecret;
const callbackURL = config.callback;

const app = express();
const redis = new Redis(); // Default connection to localhost:6379

app.set('trust proxy', true);
app.use(
  session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
  })
);

// Store tokens in Redis with an expiry time (e.g., 1 hour)
async function storeTokens(
  userId: string,
  accessToken: string,
  accessTokenSecret: string
) {
  await redis.set(`user:${userId}:accessToken`, accessToken, 'EX', 3600); // Expire in 1 hour
  await redis.set(
    `user:${userId}:accessTokenSecret`,
    accessTokenSecret,
    'EX',
    3600
  );
}

let client: tumblr.Client | null = null;

async function getTumblrClient(userId: string) {
  const { accessToken, accessTokenSecret } = await getTokens(userId);

  if (!client) {
    console.debug('>> creating new client');

    client = tumblr.createClient({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: accessToken,
      token_secret: accessTokenSecret
    });
  }

  return client;
}

// Retrieve tokens from Redis
async function getTokens(userId: string) {
  const accessToken = await redis.get(`user:${userId}:accessToken`);
  const accessTokenSecret = await redis.get(`user:${userId}:accessTokenSecret`);

  if (accessToken && accessTokenSecret) {
    return { accessToken, accessTokenSecret };
  } else {
    throw new Error('Tokens not found or expired');
  }
}

const oauthClient = new OAuth(
  'https://www.tumblr.com/oauth/request_token',
  'https://www.tumblr.com/oauth/access_token',
  consumerKey,
  consumerSecret,
  '1.0A',
  callbackURL,
  'HMAC-SHA1'
);

const tokenStore: {
  [key: string]: { oauthToken: string; oauthTokenSecret: string };
} = {};

app.get('/login', (req: Request, res: Response) => {
  oauthClient.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error('Error getting OAuth request token:', error);
      res.status(500).send('Authentication error');
    } else {
      // Use a unique identifier for each user (e.g., session ID or IP address)
      const sessionId = req.sessionID; // Replace with a more secure ID in production
      tokenStore[sessionId] = { oauthToken, oauthTokenSecret };

      // Redirect the user to Tumblr's authorization page
      const authorizationUrl = `https://www.tumblr.com/oauth/authorize?oauth_token=${oauthToken}`;
      res.redirect(authorizationUrl);
    }
  });
});

app.get('/callback', (req: Request, res: Response) => {
  const sessionId = req.sessionID; // Use the same unique identifier as in `/login`
  const { oauthToken, oauthTokenSecret } = tokenStore[sessionId] || {};

  const oauthVerifier = req.query.oauth_verifier as string;

  if (!oauthToken || !oauthTokenSecret) {
    res.status(400).send('Token not found. Please try logging in again.');
    return;
  }

  oauthClient.getOAuthAccessToken(
    oauthToken,
    oauthTokenSecret,
    oauthVerifier,
    async (error, accessToken, accessTokenSecret) => {
      if (error) {
        console.error('Error getting OAuth access token:', error);
        res.status(500).send('Authentication error');
      } else {
        await storeTokens(sessionId, accessToken, accessTokenSecret);

        // Clear the temporary tokens from the store
        delete tokenStore[sessionId];

        res.send('Authentication successful!');
      }
    }
  );
});

app.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = req.sessionID; // Use the session ID as the user identifier

    // Get the Tumblr client initialized with the user's access tokens
    const client = await getTumblrClient(userId);

    // Fetch the user's dashboard posts
    client.userDashboard((err, data) => {
      if (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).send('Failed to fetch dashboard');
      } else {
        res.json(data); // Send the dashboard posts as JSON response
      }
    });
  } catch (error) {
    console.error('Error getting Tumblr client:', error);
    res.status(500).send('Failed to initialize Tumblr client');
  }
});

app.get('/likes', async (req: Request, res: Response) => {
  try {
    const userId = req.sessionID; // Use the session ID as the user identifier

    // Get the Tumblr client initialized with the user's access tokens
    const client = await getTumblrClient(userId);

    // Fetch the user's dashboard posts
    client.userLikes((err, data) => {
      if (err) {
        console.error('Error fetching user likes:', err);
        res.status(500).send('Failed to fetch user likes');
      } else {
        res.json(data); // Send the dashboard posts as JSON response
      }
    });
  } catch (error) {
    console.error('Error getting Tumblr client:', error);
    res.status(500).send('Failed to initialize Tumblr client');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
