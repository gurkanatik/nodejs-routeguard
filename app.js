import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isAjax = (req) =>
  req.get('X-Requested-With') &&
  req.get('X-Requested-With').toLowerCase() === 'xmlhttprequest';

const getRedirectUrls = async (path) => {
  const paths = [path];

  if (path.includes(' ')) {
    paths.push(path.replace(/ /g, '+'));
    paths.push(path.replace(/ /g, '-'));
  }

  console.log("paths", paths);

  const result = await pool.query(
    `SELECT * FROM redirect_urls WHERE from_url = ANY($1::text[]) LIMIT 1`,
    [paths]
  );

  return result.rows[0] || null;
};

// React build folder (example)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Redirection middleware
app.use(async (req, res, next) => {
  if (req.method !== 'GET' || isAjax(req)) {
    return next();
  }

  const fullPath = decodeURIComponent(req.path).replace(/^\/+/, '');
  console.log("Requested fullPath:", fullPath);

  if (fullPath === "null") {
    return next();
  }

  try {
    const redirect = await getRedirectUrls(fullPath);
    console.log("Redirect entry:", redirect);

    if (redirect) {
      const redirectTo = redirect.to_url.startsWith('/') ? redirect.to_url : `/${redirect.to_url}`;
      console.log(`Redirecting from ${fullPath} to ${redirectTo} with status ${redirect.redirect_type}`);
      return res.redirect(Number(redirect.redirect_type), redirectTo);
    }

  } catch (err) {
    console.error('Error during redirect lookup:', err);
  }

  next();
});


// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
