const config = {
  tumblrConsumerKey: process.env.TUMBLR_CONSUMER_KEY || '',
  tumblrConsumerSecret: process.env.TUMBLR_CONSUMER_SECRET || '',
  callback: process.env.CALLBACK_URL || 'http://localhost:3000/callback'
};

export default config;
