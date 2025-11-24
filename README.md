# Samurai Sam – AI-Powered Stock Reports
> Parts of this README has been generated with AI.

**Purpose:** I built this project as a codelong during Scrimba’s [***AI Engineering Path***](https://scrimba.com/the-ai-engineer-path-c02v), so much of the frontend code is directly sourced from the lesson files - however I did build a similar solo project from scratch, which you can view here: [***Pollyglot AI Tutor***](https://project-pollyglot.vercel.app/)

**Function:** This app represents a proof-of-concept for connecting real financial data to an LLM and serving it through a simple web UI. It lets users enter stock tickers, fetches recent price data from the Polygon API, and sends that data to an OpenAI model, which then writes a short equity-style report.


## Demo

#### Live Link: https://samurai-sam-stock-picker.vercel.app/

![Samurai Sam Stockpicker GUI](/public/cover.jpg)


## What this project is about

- **Learning to wire up data + AI**  
  Taking raw stock data from Polygon and feeding it into OpenAI’s chat endpoint in a useful format.

- **Practicing prompt engineering**  
  Guiding the model with:
  - A clear system role (equity research analyst).  
  - Style examples in the prompt so the output feels like a short, focused research note.

- **Deploying AI apps on Cloudflare Workers**  
  Separating concerns into small, deployable services:
  - One Worker for Polygon.
  - One Worker for OpenAI.


## How it works

### 1. Frontend: collecting tickers

- A simple web UI (HTML, CSS, JavaScript) where you:
  - Type in up to 3 stock tickers (e.g. `MSFT`).
  - Click **Generate Report** to kick off the flow.
- The page:
  - Validates input.
  - Shows your selected tickers.
  - Swaps to a loading state while the APIs run.
  - Displays the final AI-written report.

### 2. Fetching stock data (Polygon API)

- A Cloudflare Worker (`polygon-api-worker.js`) sits between the frontend and Polygon.
- It:
  - Accepts `ticker`, `startDate`, and `endDate` as query params.
  - Calls Polygon’s aggregates endpoint.
  - Uses a secret `POLYGON_API_KEY` stored in Cloudflare (not in the frontend).
  - Cleans the response slightly (e.g. removing `request_id`) before returning JSON.

**What I practiced here:**

- Designing a small API surface for the frontend.
- Handling CORS and query parameters in a Worker.
- Keeping API keys out of client code.

### 3. Generating the report (OpenAI chat endpoint)

- Another Cloudflare Worker (`openai-api-worker-001/src/index.js`) wraps the OpenAI client.
- It:
  - Handles CORS and `OPTIONS` preflight.
  - Reads JSON from the request body (the Polygon data).
  - Builds a `messages` array for `chat.completions.create`, including:
    - A **system** message that sets the role as an equity research analyst.
    - A **user** message that:
      - Embeds the stock data.
      - Includes sample paragraphs to steer writing style and tone.
  - Calls `gpt-4.1-nano` with a slightly creative temperature.
  - Returns the model’s response as JSON to the frontend.

**What I practiced here:**

- Structuring prompts with roles and examples.
- Turning numeric time series data into something an LLM can reason about.
- Using the OpenAI Node SDK inside Cloudflare Workers.


## Tech stack

- **Frontend:**  
  HTML, CSS, vanilla JavaScript for form handling and DOM updates.

- **APIs & backend logic:**
  - **Polygon API** for recent stock price data.
  - **OpenAI Chat Completions** (`gpt-4.1-nano`) for generating the equity-style report.
  - **Cloudflare Workers**:
    - `polygon-api-worker`: fetches and returns cleaned price data.
    - `openai-api-worker-001`: wraps OpenAI and exposes a simple HTTP endpoint.

- **Tooling:**  
  - Cloudflare Wrangler for local dev and deployment.


## Running the project (high level)

This is a rough outline; exact commands may vary depending on your setup.

1. **Frontend**
   - Serve the root folder with any static server (or open `index.html` in a dev server).

2. **Polygon Worker**
   - Deploy the `polygon-api-worker` to Cloudflare.
   - Store `POLYGON_API_KEY` as a secret in Cloudflare.

3. **OpenAI Worker**
   - In `cloudflare-worker-server/openai-api-worker-001`:
     - Install dependencies.
     - Configure `OPENAI_API_KEY` as a Cloudflare secret.
     - Deploy with Wrangler.

4. **Connect everything**
   - Point the frontend `fetch` calls at your deployed Worker URLs.


## What I learned

- **End-to-end flow**: from user input → external data → LLM → UI output.
- **Prompt design**: combining structured data with style examples to get consistent responses.
- **Cloudflare Workers**: using them as lightweight API layers for both third-party APIs and OpenAI.
- **Practical concerns**: CORS, secrets management, and keeping API keys out of the browser.
