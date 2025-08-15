# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Umami is a simple, fast, privacy-focused alternative to Google Analytics built with Next.js and React. The application supports multiple databases (MySQL, PostgreSQL, ClickHouse) and provides web analytics tracking with real-time dashboards.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Full production build (includes database, tracker, geo data, and app)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with quiet output

### Database Operations
- `npm run build-db` - Copy database files and generate Prisma client
- `npm run check-db` - Verify database connection and structure
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:dev` - Run database migrations in development
- `npm run prisma:deploy` - Deploy database migrations to production

### Build Components
- `npm run build-tracker` - Build JavaScript tracking script using Rollup
- `npm run build-geo` - Build geolocation data
- `npm run build-app` - Build Next.js application only
- `npm run update-tracker` - Update tracking script

### Language & Internationalization
- `npm run build-lang` - Complete language build process
- `npm run extract-lang` - Extract translatable strings from components
- `npm run merge-lang` - Merge language files
- `npm run format-lang` - Format language files
- `npm run compile-lang` - Compile language files for production

## Architecture

### Core Technologies
- **Frontend**: Next.js 12 with React 17, CSS modules, React Intl for i18n
- **Backend**: Next.js API routes with middleware
- **Database**: Prisma ORM supporting MySQL, PostgreSQL, and ClickHouse
- **State Management**: Zustand for client state
- **Analytics**: Custom tracking script built with Rollup

### Directory Structure

#### `/components/`
- `common/` - Reusable UI components (Button, Modal, Table, etc.)
- `forms/` - Form components for authentication and website management
- `layout/` - Layout components (Header, Footer, Page structure)
- `metrics/` - Analytics visualization components (charts, tables, dashboards)
- `pages/` - Page-level components (Dashboard, Settings, etc.)
- `settings/` - Settings and configuration components

#### `/pages/`
- Next.js pages with file-based routing
- `/api/` - Backend API endpoints organized by feature
- Authentication, analytics collection, and admin functions

#### `/lib/`
Core utility modules:
- `auth.js` - Authentication logic
- `db.js` - Database connection and utilities
- `prisma.js` - Prisma client configuration
- `session.js` - Session management
- `crypto.js` - Encryption and hashing utilities
- `date.js` - Date/time formatting and timezone handling

#### `/queries/`
Database query functions organized by domain:
- `admin/` - User and website management queries
- `analytics/` - Pageview, event, and session analytics queries

#### `/db/`
Database schemas and migrations for each supported database type (MySQL, PostgreSQL, ClickHouse)

#### `/tracker/`
Client-side tracking scripts that websites embed to send analytics data

### Key Features
- **Multi-database support** with environment-based schema selection
- **Real-time analytics** with WebSocket updates
- **Internationalization** supporting 40+ languages
- **Privacy-focused** design with no personal data collection
- **Custom event tracking** with structured event data
- **Geographic data** for visitor location analytics
- **Share functionality** for public analytics dashboards

### Environment Configuration
- `DATABASE_URL` - Primary database connection string
- `BASE_PATH` - Optional base path for deployment
- `FORCE_SSL` - Enable HTTPS security headers
- Database-specific environment variables for BigQuery, ClickHouse, Redis

### Database Models
Core entities: `account`, `website`, `session`, `pageview`, `event`, `event_data`
- Websites belong to accounts (users)
- Sessions track visitor browser/device info with geographic data
- Pageviews and events link to sessions and websites
- Event data supports custom JSON properties

### Security Features
- Content Security Policy headers
- CSRF protection via middleware
- Encrypted passwords using bcrypt
- Session-based authentication
- Optional SSL enforcement