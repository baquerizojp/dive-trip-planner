# Dive Trip Organizer

This is a minimal web application to help organize group scuba-diving trips.  
It’s built with React (via CDN), stores data in **Supabase** for cross-device sync, and falls back to `localStorage` if you’re offline.  
Host it anywhere static (GitHub Pages, Netlify, Cloudflare Pages…).

## Features

- Create, edit, and delete dive trips  
- Track participants with interest / payment status  
- Auto-sort participants (confirmed & paid first)  
- One-click WhatsApp message generation for trip announcements  
- Upcoming vs. past trips split by date  

## Running Locally

1. **Supabase setup**  
   - Create a project with two tables:  
     - `trips` → `id` (int, PK), `title`, `date`, `location`, `cost`, `description`, `min`, `max`  
     - `participants` → `id` (int, PK), `trip_id` (FK to trips), `name`, `interest`, `payment`  
2. In `public/app.jsx`, drop in your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.  
3. Open `public/index.html` in a modern browser.  
   - No Supabase credentials? The app silently switches to `localStorage` so you can still play around.

## Deployment

Upload everything inside `public/` to your static host and point your sub-domain (e.g. **dive.mydomain.com**) at it.

## Future Work

- User authentication for trip management  
- Nice-to-have: offline-first UI polish & service-worker caching