/**
 * Andean Summit — Decap CMS GitHub OAuth proxy
 *
 * Decap CMS opens a popup pointing at GET /auth on this Worker.
 * We redirect that popup to GitHub's OAuth authorize URL.
 * GitHub redirects back to /callback with a `code`.
 * We exchange the code for an access token, then post a message back
 * to the opener window (the Decap admin page) containing the token.
 *
 * Secrets (set with `wrangler secret put`):
 *   - OAUTH_CLIENT_ID
 *   - OAUTH_CLIENT_SECRET
 *
 * No other configuration required.
 */

const SCOPE = 'repo,user';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      // Step 1 — kick off the OAuth flow
      const githubAuthURL = new URL('https://github.com/login/oauth/authorize');
      githubAuthURL.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
      githubAuthURL.searchParams.set('scope', SCOPE);
      githubAuthURL.searchParams.set('redirect_uri', `${url.origin}/callback`);
      return Response.redirect(githubAuthURL.toString(), 302);
    }

    if (url.pathname === '/callback') {
      // Step 2 — exchange code for token, then notify the opener
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: env.OAUTH_CLIENT_ID,
          client_secret: env.OAUTH_CLIENT_SECRET,
          code
        })
      });

      const data = await tokenRes.json();

      if (data.error) {
        return new Response(`OAuth error: ${data.error_description || data.error}`, { status: 500 });
      }

      const payload = JSON.stringify({
        token: data.access_token,
        provider: 'github'
      });

      // Decap handshake:
      //   1. popup posts 'authorizing:github' to opener
      //   2. opener echoes 'authorizing:github' back
      //   3. popup posts 'authorization:github:success:{json}' and closes
      const escapedPayload = payload.replace(/</g, '\\u003c').replace(/'/g, "\\'");
      const html = `<!DOCTYPE html>
<html><head><title>Authorising…</title></head>
<body style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 2rem; color: #1B4332;">
  <p>Authorising… you can close this window if it doesn't close automatically.</p>
  <script>
    (function () {
      var payload = 'authorization:github:success:${escapedPayload}';
      function sendReady() {
        if (window.opener) window.opener.postMessage('authorizing:github', '*');
      }
      window.addEventListener('message', function (e) {
        if (e.data === 'authorizing:github' && window.opener) {
          window.opener.postMessage(payload, e.origin);
          setTimeout(function () { window.close(); }, 500);
        }
      }, false);
      // Announce we're ready; retry a few times in case the opener is still booting
      sendReady();
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (tries > 10) { clearInterval(iv); return; }
        sendReady();
      }, 300);
    })();
  </script>
</body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('Andean Summit · CMS OAuth proxy · /auth to begin', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
