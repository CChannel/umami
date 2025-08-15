# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Umami is a privacy-focused web analytics alternative to Google Analytics. This is a Next.js application that provides both a dashboard interface and tracking capabilities with support for multiple databases (PostgreSQL, MySQL, ClickHouse).

## Development Commands

### Core Development
- **Start development server**: `yarn dev` (runs on http://localhost:3000)
- **Build application**: `yarn build` (full production build including database setup, tracker, and app)
- **Start production server**: `yarn start`
- **Lint code**: `yarn lint`

### Database Operations
- **Generate Prisma client**: `yarn prisma:generate`
- **Run database migrations (dev)**: `yarn prisma:dev`
- **Deploy database migrations**: `yarn prisma:deploy`
- **Check database connection**: `yarn check-db`
- **Build database files**: `yarn build-db`

### Build Components
- **Build tracker script**: `yarn build-tracker` (creates the analytics tracking script)
- **Build geo data**: `yarn build-geo`
- **Build app only**: `yarn build-app`

### Internationalization
- **Extract messages**: `yarn extract-lang`
- **Merge language files**: `yarn merge-lang`
- **Format language files**: `yarn format-lang`
- **Compile language files**: `yarn compile-lang`
- **Build all language files**: `yarn build-lang`

### Docker
- **Build for Docker**: `yarn build-docker`
- **Start with Docker compose**: `docker compose up`

## Architecture Overview

### Frontend Structure
- **Pages**: Next.js pages in `/pages` directory with API routes in `/pages/api`
- **Components**: Organized in `/components` with subdirectories:
  - `common/`: Reusable UI components (Button, Modal, Table, etc.)
  - `metrics/`: Analytics-specific components (charts, tables, filters)
  - `layout/`: Layout components (Header, Footer, Page structure)
  - `forms/`: Form components for settings and configuration
  - `settings/`: Settings-related components

### Backend Architecture
- **Database Layer**: 
  - Prisma ORM with multiple database support (PostgreSQL, MySQL, ClickHouse)
  - Read/write database splitting support via `DATABASE_RO_URL`
  - Query abstraction in `/queries` directory organized by domain
- **API Layer**: RESTful APIs in `/pages/api` handling authentication, data collection, and analytics
- **Data Collection**: `/pages/api/collect.js` handles all tracking data ingestion
- **Session Management**: Custom session handling in `/lib/session.js`

### Key Libraries and Architecture Decisions
- **Next.js 12+**: React framework with API routes
- **Prisma**: Database ORM with schema in `/prisma`
- **React 17**: Frontend framework
- **Zustand**: State management (see `/store` directory)
- **React-Intl**: Internationalization support
- **Chart.js**: Data visualization
- **CSS Modules**: Component-scoped styling

### Tracking System
- **Tracker Script**: Built from `/tracker/index.js` using Rollup
- **Data Collection**: Supports pageviews and custom events
- **Cross-domain Tracking**: Configurable via environment variables
- **Privacy Features**: DoNotTrack support, IP ignoring, bot detection

## Environment Configuration

Key environment variables (see `.env.local.example`):
- `DATABASE_URL`: Primary database connection (required)
- `DATABASE_RO_URL`: Read-only database connection (optional)
- `HASH_SALT`: Random string for generating unique values
- `TRACKER_SCRIPT_NAME`: Custom tracker script name (default: umami)
- `COLLECT_API_ENDPOINT`: Custom collection endpoint
- `FORCE_SSL`: Redirect HTTP to HTTPS
- `IGNORE_IP`: Comma-delimited IPs to exclude
- `DATABASE_TYPE`: Required for Docker builds (mysql/postgresql)

## Database Support

The application supports multiple databases through abstraction layers:
- **PostgreSQL**: Primary supported database
- **MySQL**: Full support with MySQL-specific query adaptations
- **ClickHouse**: For high-volume analytics with Kafka integration
- **Prisma Schema**: Located in `/db/{database}/schema.prisma`

## Code Quality and Linting

- **ESLint**: Configured with Next.js and Prettier integration
- **Prettier**: Code formatting with specific rules (single quotes, 100 char width)
- **Stylelint**: CSS linting for CSS modules
- **Husky**: Git hooks for pre-commit linting (lint-staged)

## Testing

This project uses a **TestConsole** component for manual testing but does not have a comprehensive automated test suite. Testing is primarily done through:
- Manual testing via `/console` route with test tracking implementation
- Database testing through `yarn check-db`

## Important File Paths

- **Database schemas**: `/db/{database-type}/schema.prisma`
- **Tracker source**: `/tracker/index.js`
- **Main collection API**: `/pages/api/collect.js`
- **Query abstractions**: `/queries/` (organized by domain: admin, analytics)
- **Internationalization**: `/lang/` and `/public/intl/`
- **Build scripts**: `/scripts/`

## Development Notes

- Node.js 22+ required (see `engines` in package.json)
- Uses CSS Modules for component styling
- Supports both npm and yarn (yarn.lock present)
- Environment-specific builds supported for different databases
- Custom build pipeline that includes database setup, tracker compilation, and app building