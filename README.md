# Windsurf Project

This is a monorepo containing multiple projects, including Catechize.org.

## Projects

- [Catechize](#catechizeorg) - A Lutheran media hub for organizing and accessing podcasts and other media content.

## Documentation

- [Type System Best Practices](./docs/TYPE_SYSTEM.md) - Guidelines for maintaining type safety across the application
- [Project Structure Guidelines](./docs/PROJECT_STRUCTURE.md) - Best practices for project organization
- [Development Progress](./DEVELOPMENT_PROGRESS.md) - Ongoing development updates and progress tracking

## Project Structure

```
windsurf-project/
├── catechize/        # Main application directory
│   ├── components/   # Reusable Vue components
│   ├── composables/  # Vue composables for shared logic
│   ├── pages/       # Application routes and pages
│   ├── stores/      # Pinia stores for state management
│   ├── types/       # TypeScript type definitions
│   └── supabase/    # Database migrations and configuration
├── docs/            # Project-wide documentation
│   └── TYPE_SYSTEM.md
└── DEVELOPMENT_PROGRESS.md
```

## Contributing

Please refer to the individual project READMEs for specific contribution guidelines.

## Catechize.org

A Lutheran media hub for organizing and accessing podcasts and other media content.

### Features

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

### Tech Stack

- Framework: Nuxt 4+
- Authentication & Database: Supabase
- State Management: Pinia
- UI: Tailwind CSS
- Package Manager: pnpm
- TypeScript support

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd windsurf-project
```

2. Install dependencies:
```bash
cd catechize
pnpm install
```

3. Create a Supabase project and get your credentials

4. Create a `.env` file in the catechize directory:
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

### Contributing

Please follow these guidelines when contributing:
1. Run local builds before committing: `npm run build`
2. Follow the [Type System Best Practices](./docs/TYPE_SYSTEM.md)
3. Update documentation as needed

### License

[MIT License](LICENSE)
