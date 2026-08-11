# Qawla Security Hardening Report

This build includes a security hardening pass focused on PayPal Checkout, admin authentication, backups, API exposure, and production headers.

## Changes
- Removed the default admin password fallback. `ADMIN_PASSWORD_HASH` is now required.
- Added server-side PayPal order verification before capture.
- Server now validates PayPal order reference, currency, and amount against the pending payment record when Firebase is configured.
- Added server-side payment records in `paypal_payments`.
- Added PayPal webhook signature verification using `PAYPAL_WEBHOOK_ID`.
- Added webhook event idempotency records in `paypal_webhook_events`.
- Sanitized PayPal and backup API error responses.
- Removed wildcard CORS from admin backup endpoints.
- Added validation for backup IDs.
- Added additional API rate limiting to backup and webhook endpoints.
- Added security response headers.
- Removed the local `db/custom.db` from the distributable archive.
- Added `.env.example`; real secrets must be supplied only through deployment environment variables.
- Raised the minimum declared Next.js/React versions to security-patched release lines.

## Required production variables
- `PAYPAL_ENVIRONMENT=live`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_WEBHOOK_ID`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_JWT_SECRET`
- Firebase service-account variables when Firebase is used

## Important deployment checks
1. Create the PayPal webhook in the PayPal Developer Dashboard and copy its Webhook ID to `PAYPAL_WEBHOOK_ID`.
2. Configure the webhook URL as `https://YOUR-DOMAIN/api/paypal/webhook`.
3. Keep `PAYPAL_CLIENT_SECRET`, `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD_HASH`, and Firebase private keys server-side only.
4. Do not commit `.env` or database files.
5. Run the package manager install from the lockfile and run a full production build before going live.

## Verification limitation
The audit environment did not contain `node_modules`, and package installation could not complete because the sandbox package mirror was missing a Tailwind WASM artifact. Therefore a final TypeScript/build/npm-audit pass could not be completed here.
