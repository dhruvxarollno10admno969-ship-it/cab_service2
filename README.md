# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# cab_service2

## Email OTP configuration

Before deploying the email verification functions, configure the Resend API key,
a random HMAC key, and a sender address verified with Resend:

```sh
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set OTP_HMAC_SECRET
firebase functions:secrets:set OTP_FROM_EMAIL
firebase deploy --only functions
```

Use a unique, high-entropy value for `OTP_HMAC_SECRET`. `OTP_FROM_EMAIL` must be
an address on a domain verified in Resend. The web app must also have
`VITE_RECAPTCHA_SITE_KEY` configured because both OTP functions enforce Firebase
App Check.

For local development on an HTTP IP address or a browser without
`crypto.randomUUID()`, set `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` in `.env` to a
unique random string and register the same string in Firebase Console under
**App Check → your web app → Manage debug tokens**. For example, generate a
value with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Restart the development server after changing `.env`. Do not use a registered
debug token in production. A local account may already exist if signup
previously created it before OTP delivery failed; sign in to that account to
retry verification instead of signing up again.
