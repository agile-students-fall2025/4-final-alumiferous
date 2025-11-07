# Alumiferous Project – Back-End

This is the Express.js back-end for the Alumiferous project.  
It provides all core API routes, serves static files, and uses modern team conventions to make development easy and collaborative.

---

## Setup

1. **Install Node.js and npm** if not already installed.
2. **Navigate to the back-end directory:**

cd back-end

3. **Install dependencies:**
   npm install

4. **Configure environment variables:**

- Copy `.env.example` to `.env`
- Set any needed variables (like PORT or API keys)

---

## Running the Server

- **Start normally:**
  npm start

- **Start in development mode (auto-reloads on changes):**
  npm run dev

Server defaults to port 3000 unless you specify `PORT` in your `.env`.

---

## Project Structure

```
back-end/
├──app.js # Express app and route definitions
├──server.js # Entry point, starts the server
├──public/ # Static assets (images, CSS, uploads)
├──test/ # Unit and integration tests (Mocha, Chai)
├──.env.example # Sample environment variable file
```

---

## Testing

- **Run all tests:**
  npm test

- **Check code coverage:**
  npm run coverage

Mocha/Chai will run tests from the `test/` directory.  
c8 reports code coverage in the console.

---

## API Overview

All core endpoints are documented in `app.js` as comments.  
Static files are served from `/static`.

---

## Contribution and License

- **Contributions:** Please use feature branches and pull requests.
- **License:** GPL-3.0-or-later. See LICENSE for full details.
