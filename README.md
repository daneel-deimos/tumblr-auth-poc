# Tumblr OAuth Proof of Concept

This proof of concept demonstrates how to authenticate users with Tumblr using OAuth 1.0a in a Node.js application. After authentication, it retrieves the user's access tokens and stores them in Redis for subsequent API calls. The application provides an example endpoint to fetch the authenticated user’s Tumblr dashboard posts.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Packages](#packages)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)

## Technologies Used

- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Web framework for handling HTTP requests.
- **Redis**: In-memory data structure store, used here to store access tokens temporarily.
- **Tumblr API**: Used to retrieve user data via authenticated API requests.

## Packages

- **express**: Web framework for Node.js.
- **express-session**: Middleware to manage session data.
- **ioredis**: Redis client for Node.js, used to interact with Redis.
- **oauth**: Library to manage the OAuth 1.0a authentication flow.
- **tumblr.js**: Client library for the Tumblr API, allowing authenticated API requests.

## Setup Instructions

1. **Clone the Repository**
    
```bash
git clone <repository-url>
cd <repository-directory>
```
    
2. **Install Dependencies**

```bash
npm install
```
    
3. **Set Up Redis Locally**
    
    - Install Redis:
        - macOS: `brew install redis`
        - Linux: `sudo apt update && sudo apt install redis-server`
    - Start Redis:
        - macOS: `brew services start redis`
        - Linux: `sudo systemctl start redis-server`
4. **Create a Tumblr Application**
    
    - Go to the Tumblr Developer Portal and create a new application.
    - Set the callback URL to `http://localhost:3000/callback`.
    - Copy your `consumer_key` and `consumer_secret` from the Tumblr app settings.
5. **Environment Variables**
    
    - Create a `.env` file in the root of your project and add the following variables:

```env        
CONSUMER_KEY=<your_consumer_key>
CONSUMER_SECRET=<your_consumer_secret>
CALLBACK_URL=http://localhost:3000/callback
```
        
6. **Run the Application**

```bash
npm run start:dev
```
    
The server will start on `http://localhost:3000`.
    

## Usage

1. **Authenticate with Tumblr**
    
    - Visit `http://localhost:3000/login` in your browser. The application will redirect you to Tumblr’s authorization page.
    - After you authorize the app, Tumblr redirects you to the callback route (`/callback`) where access tokens are saved to Redis.
2. **Fetch Dashboard Posts**
    
    - After authentication, you can retrieve the user’s dashboard posts by visiting `http://localhost:3000/dashboard`. This endpoint retrieves tokens from Redis and makes an authenticated request to the Tumblr API.

## Example Code

### OAuth Authentication Flow

- **/login**: Starts the OAuth flow, gets a request token, and redirects to Tumblr for authorization.
- **/callback**: Handles the callback after authorization, exchanges the request token for an access token, and saves it in Redis.

### API Call Example

- **/dashboard**: Uses stored access tokens to fetch the authenticated user’s dashboard posts.
- **/likes**: Uses stored access tokens to fetch the authenticated user’s liked posts.

---

## License

This project is licensed under the MIT License.

## Starter code taken from blog posts by [Khalil Stemmler](https://khalilstemmler.com/)

1. [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
2. [How to use ESLint with TypeScript](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/)
3. [How to use Prettier with ESLint and TypeScript in VSCode](https://khalilstemmler.com/blogs/tooling/prettier/)
4. [Enforcing Coding Conventions with Husky Pre-commit Hooks](https://khalilstemmler.com/blogs/tooling/enforcing-husky-precommit-hooks/)

## Further resources

1. [Awesome ESLint](https://github.com/dustinspecker/awesome-eslint) - ESLint plugins and configs.
2. [ESLint Rules](https://eslint.org/docs/latest/rules/) - Rules in ESLint are grouped by type to help you understand their purpose.
3. [Prettier options](https://prettier.io/docs/en/options.html) - Prettier ships with a handful of format options.
4. [Enforcing Coding Conventions with Husky Pre-commit Hooks](https://khalilstemmler.com/blogs/tooling/enforcing-husky-precommit-hooks/) - learn how to setup Husky to prevent bad git commits and enforce code standards in your project.
5. [Why husky has dropped conventional JS config](https://blog.typicode.com/husky-git-hooks-javascript-config/)
6. [lint-staged](https://github.com/okonet/lint-staged) - It runs the linter, but only against files that are staged (files that you're ready to push).
