# RouteGuard: NodeJS Middleware for 301 Redirections

A lightweight Express.js middleware for handling 301 redirections in React.js and similar SPA projects.

## Overview

This project provides a middleware solution for managing URL redirections in Single Page Applications (SPAs). It's particularly useful for maintaining SEO rankings when migrating websites or changing URL structures by implementing proper 301 (permanent) redirects.

## Features

- Handles 301 redirections based on database records
- Supports multiple URL format variants (with spaces, hyphens, or plus signs)
- Preserves SPA functionality with a fallback mechanism
- AJAX request detection to avoid redirection for API calls
- Simple database integration with PostgreSQL

## Requirements

- Node.js
- PostgreSQL database with a `redirect_urls` table

## Installation

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file based on the `.env-example`:
```
DATABASE_URL=postgres://username:password@postgresqlserver:5432/database
PORT=3000
```

## Database Setup

The middleware requires a PostgreSQL database with a `redirect_urls` table containing:
- `from_url`: The original URL path
- `to_url`: The destination URL path
- `redirect_type`: The HTTP status code (typically 301)

### PostgreSQL Table Creation

```sql
CREATE TABLE redirect_urls (
  id SERIAL PRIMARY KEY,
  from_url VARCHAR(255) NOT NULL,
  to_url VARCHAR(255) NOT NULL,
  redirect_type INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_redirect_urls_from_url ON redirect_urls(from_url);

-- Example data
INSERT INTO redirect_urls (from_url, to_url, redirect_type) 
VALUES 
  ('old-page', 'new-page', 301),
  ('blog/old-article', 'articles/new-article', 301),
  ('products/discontinued-item', 'products', 301);
```

## Usage

Start the server:
```
node app.js
```

The middleware will automatically check incoming requests against the redirect_urls table and perform redirections as needed.

## How It Works

1. An HTTP GET request arrives
2. The middleware checks if it's an AJAX request (ignores these)
3. The URL path is looked up in the database
4. If a match is found, a 301 redirect is performed
5. If no match is found, the request continues to the SPA fallback

## License

ISC 