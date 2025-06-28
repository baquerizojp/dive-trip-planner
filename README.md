# Dive Trip Organizer

This is a minimal web application to help organize group scuba diving trips. It is built using React via CDN and stores data in browser local storage. The app can be hosted for free using any static hosting provider (e.g. GitHub Pages or Netlify).

## Features

- Create, edit, and delete dive trips
- Track participants with interest and payment status
- Automatically sort participants (confirmed & paid first)
- Generate WhatsApp messages for trip announcements
- Separate upcoming and past trips by date

## Running Locally

Simply open `public/index.html` in a modern browser. All data is stored in `localStorage`.

## Deployment

Upload the `public/` folder contents to any static hosting service and point your subdomain (e.g. `dive.mydomain.com`) to it.

## Future Work

- Replace `localStorage` with Supabase for cross-device sync
- User authentication for managing trips

