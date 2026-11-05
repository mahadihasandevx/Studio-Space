# StudioSpace

StudioSpace helps creators find and book photo studios, film stages, podcast rooms, music suites, and art workshops.

**Live URL:** Not deployed yet. Replace this note with the production URL before submission.

## Features

- Browse, search, filter, sort, and paginate creative studio listings.
- View studio photo galleries, amenities, host details, ratings, and reviews.
- Register or sign in with email/password or Google OAuth.
- Keep authenticated API sessions in a secure, HTTP-only cookie.
- Create, edit, and delete studio listings.
- Request bookings, prevent overlapping confirmed bookings, and manage booking status.
- Save studios to a personal wishlist.
- Download PDF invoices for confirmed bookings.
- Use responsive light and dark themes with reduced-motion support.
- Subscribe to the StudioSpace newsletter.

## Stack

Next.js App Router, React, TypeScript, Better Auth, MongoDB, Express API, Zod, React Hook Form, Motion, Swiper, next-themes, Sonner, and jsPDF.

## Local setup

1. Install Node.js 20+ and a reachable MongoDB instance.
2. Copy `.env.example` to `.env` and set the variables described below.
3. Use the same `MONGODB_URI` in the client and server. Set `JWT_SECRET` to the exact same 64-character hexadecimal value in both applications. Keep `BETTER_AUTH_SECRET` separate and private to the client.
4. In Google Cloud OAuth, allow `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI when Google sign-in is enabled.
5. In this directory, run:

   ```bash
   npm install
   npm run dev
   ```

6. In `../studiospace-server`, install dependencies, configure its `.env`, seed the database, and start the API as shown in the server README. The client runs at `http://localhost:3000`; the API defaults to `http://localhost:4000`.

## Client environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express API origin used by the Next.js rewrite; defaults to `http://localhost:4000`. |
| `BETTER_AUTH_SECRET` | Private Better Auth signing/encryption secret. |
| `BETTER_AUTH_URL` | Public origin of the Next.js app, such as `http://localhost:3000`. |
| `MONGODB_URI` | MongoDB connection string for Better Auth. Use the same cluster/database as the API. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID; optional if Google sign-in is not used. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret; optional if Google sign-in is not used. |
| `JWT_SECRET` | 64-character hexadecimal API session signing key; must match the server value. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Optional ImgBB upload key. If unset, studio images can be added by public URL. |

Never commit `.env` files or real credentials.

## Demo examiner account

- **Email:** `examiner@studiospace.com`
- **Password:** `Examiner123`

The server seed command creates this account and 15 clearly labeled demo studios with sample reviews. These fixtures are not real listings or endorsements. Run the seed only against a local or otherwise intended database.
