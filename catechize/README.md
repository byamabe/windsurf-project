# Catechize.org

A Lutheran media hub for organizing and accessing podcasts and other media content.

## Features

- Podcast hosting and management
- Video and audio content integration
- Content organization by Loci, Authors, and Questions
- Transcript support
- User ratings and favorites
- Subscription-based premium features
  - Custom playlists
  - Comments
  - Premium content access
  - Interactive learning games

## Tech Stack

- Framework: Nuxt 4+
- Authentication & Database: Supabase
- State Management: Pinia
- UI: Tailwind CSS
- Package Manager: pnpm
- TypeScript support

## Prerequisites

- Node.js 18+
- pnpm
- Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd catechize
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a Supabase project and get your credentials

4. Create a `.env` file in the root directory:
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

5. Run the database migrations:
- Copy the SQL from `supabase/migrations/00_initial_schema.sql`
- Run it in your Supabase SQL editor

6. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

- `components/` - Reusable Vue components
- `composables/` - Vue composables for shared logic
- `pages/` - Application routes and pages
- `stores/` - Pinia stores for state management
- `types/` - TypeScript type definitions
- `supabase/` - Database migrations and configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[MIT License](LICENSE)
