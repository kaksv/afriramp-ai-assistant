# AfriRamp AI Assistant

A responsive React + Vite chat prototype for asking questions about AfriRamp and international payment challenges faced by African freelancers. The browser sends questions to an existing FastAPI service; it does not download model weights or run inference.

This is an informational prototype only. It does not process payments, hold funds, calculate exchange rates, or connect to banks.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- The FastAPI inference service, when testing chat responses

## Run locally

```sh
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to the base URL of the FastAPI service. For local development:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Then start the app:

```sh
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. Restart Vite after changing `.env`; Vite environment variables are read when the development server starts.

## API contract

The frontend expects the FastAPI service to implement:

### Health check

```http
GET /
```

```json
{"status":"online","service":"AfriRamp AI"}
```

The header checks this endpoint once when the app opens and when the user requests a check. “API online” confirms only that the health endpoint is reachable; it does not confirm that model inference is available.

### Chat

```http
POST /chat
Content-Type: application/json
```

Request:

```json
{"message":"What is AfriRamp?"}
```

Response:

```json
{"reply":"The actual generated response from the model"}
```

The API base URL is read from `VITE_API_URL`. The app trims trailing slashes, applies a 30-second request timeout, and displays a retryable error for network, HTTP, timeout, malformed JSON, or missing-reply failures.

## FastAPI CORS

The backend must allow browser requests from each origin used to access the frontend. At minimum, allow the local Vite origin (`http://localhost:5173`; also allow `http://127.0.0.1:5173` if you use that host) and the exact deployed Vercel origin (for example, `https://your-project.vercel.app`). Add custom Vercel domains as well if used.

Configure this on FastAPI with `CORSMiddleware`, allowing the listed origins, `GET` and `POST` methods, and the `Content-Type` header. React code cannot bypass a backend CORS policy. Do not use a wildcard origin for a credentialed production API.

## Kaggle / Cloudflare Quick Tunnel

A Cloudflare Quick Tunnel URL is temporary and can change when the tunnel restarts. Update `VITE_API_URL` to the current tunnel URL, then restart Vite locally or redeploy the Vercel frontend. The Kaggle session hosting inference must remain active for the API to respond. If the session or tunnel is unavailable, the chat displays an error and offers a retry; it does not show a fabricated answer.

Keep all Hugging Face tokens, Kaggle credentials, passwords, private keys, and other backend secrets on the backend. `VITE_*` values are bundled into client-side code and are public; never put secrets in them.

## Production build

```sh
npm run build
npm run preview
```

The production files are written to `dist/`.

## Deploy to Vercel

1. Push the project to a GitHub repository.
2. Import that repository in Vercel. Keep the project root as the root directory.
3. Use the default Vite build settings: build command `npm run build`, output directory `dist`, install command `npm install`.
4. In Vercel project settings, add `VITE_API_URL` with the current FastAPI base URL. This is a public endpoint URL, not a secret.
5. Deploy or redeploy after setting the variable.
6. Add the resulting Vercel origin to the FastAPI CORS allowlist.

To connect this local folder to a new GitHub repository:

```sh
git init -b main
git add .
git commit -m "Build AfriRamp AI assistant"
git remote add origin https://github.com/<your-account>/<repository>.git
git push -u origin main
```

## Project structure

```text
src/
  components/
    ChatHeader.jsx
    ChatInput.jsx
    ChatMessage.jsx
    ConnectionStatus.jsx
    SuggestedPrompts.jsx
  services/
    api.js
  styles/
    chat.css
    global.css
  App.jsx
  main.jsx
.env.example
brand.md
```
