# Dive Trip Organizer

This is a minimal web application to help organize group scuba diving trips. It is built using React via CDN. Data is stored in [Supabase](https://supabase.com) for cross-device sync with a localStorage fallback. The app can be hosted for free using any static hosting provider (e.g. GitHub Pages or Netlify).

## Features

- Create, edit, and delete dive trips
- Track participants with interest and payment status
- Automatically sort participants (confirmed & paid first)
- Generate WhatsApp messages for trip announcements
- Separate upcoming and past trips by date

## Running Locally

1. Create a Supabase project with `trips` and `participants` tables.
   - `trips` columns: `id` (int, PK), `title`, `date`, `location`, `cost`, `description`, `min`, `max`.
   - `participants` columns: `id` (int, PK), `trip_id` (FK to trips), `name`, `interest`, `payment`.
2. Update `public/app.jsx` with your Supabase URL and anon key.
3. Open `public/index.html` in a modern browser.

## Deployment

Upload the `public/` folder contents to any static hosting service and point your subdomain (e.g. `dive.mydomain.com`) to it.

## Future Work

- User authentication for managing trips

