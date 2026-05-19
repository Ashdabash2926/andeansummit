# Andean Summit CMS — OAuth proxy

Tiny Cloudflare Worker that bridges Decap CMS's admin UI and GitHub OAuth.
Ash deploys this once. After that, the client logs into `/admin/` with
their GitHub account, edits content, hits save, and the changes commit
to the repo. No further maintenance needed.

## One-time setup (~10 minutes)

### 1. Create a GitHub OAuth App

1. Open <https://github.com/settings/applications/new>
2. Fill in:
   - **Application name:** `Andean Summit CMS`
   - **Homepage URL:** `https://ashdabash2926.github.io/andeansummit/`
   - **Authorization callback URL:** `https://andean-cms-auth.<YOUR-CF-ACCOUNT>.workers.dev/callback`
     *(use a placeholder for now; you'll update it after Step 3)*
3. Register the app → note the **Client ID** and **Client Secret**.

### 2. Install wrangler (one-time)

```bash
npm install -g wrangler
wrangler login
```

### 3. Deploy the Worker

```bash
cd workers/andean-cms-auth
wrangler deploy
```

The first deploy prints the live URL — typically
`https://andean-cms-auth.<your-cf-account>.workers.dev`. Copy that URL.

### 4. Set the OAuth secrets

```bash
wrangler secret put OAUTH_CLIENT_ID
# paste the GitHub Client ID from step 1, press enter

wrangler secret put OAUTH_CLIENT_SECRET
# paste the GitHub Client Secret from step 1, press enter
```

### 5. Update the GitHub OAuth App callback

Back at <https://github.com/settings/developers> → your app → set
**Authorization callback URL** to the *real* Worker URL from step 3:

```
https://andean-cms-auth.<your-cf-account>.workers.dev/callback
```

### 6. Point Decap at the Worker

In `andeansummit/admin/config.yml`, set:

```yaml
backend:
  name: github
  repo: Ashdabash2926/andeansummit
  branch: main
  base_url: https://andean-cms-auth.<your-cf-account>.workers.dev
  auth_endpoint: auth
```

Commit + push that change.

### 7. Test the loop

1. Open `https://ashdabash2926.github.io/andeansummit/admin/`
2. Click **Login with GitHub** → authorise → land back in the admin UI
3. Edit a Departure → Save
4. Within ~60 s the change is live on the home page

Done. Hand the admin URL to the client.

## Endpoints

| Method | Path        | Purpose |
|--------|-------------|---------|
| GET    | `/auth`     | Redirects to GitHub OAuth |
| GET    | `/callback` | Exchanges code for token, posts it back to Decap |
| GET    | `/`         | Health check (returns plain text) |
