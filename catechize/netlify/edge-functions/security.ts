import type { Context } from '@netlify/edge-functions';

// Rate limiting configuration
const RATE_LIMIT = 60; // requests per minute
const BLOCK_DURATION = 300; // 5 minutes in seconds

// Bot detection patterns
const BOT_PATTERNS = [
  /Special:/i,
  /Talk:/i,
  /action=/i,
  /index\.php/i,
  /wp-/i,
  /wordpress/i,
  /\.env/i,
  /\.git/i,
  /\.sql/i,
  /admin/i,
  /login/i,
  /xmlrpc/i
];

// Known spam keywords
const SPAM_KEYWORDS = [
  'cbd',
  'casino',
  'porn',
  'sex',
  'viagra',
  'crypto',
  'bitcoin',
  'repair',
  'iphone repair'
];

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const ip = context.ip;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check for bot patterns in URL
  if (BOT_PATTERNS.some(pattern => pattern.test(url.pathname + url.search))) {
    return new Response('Not Found', { status: 404 });
  }

  // Check for spam keywords
  const urlLower = url.toString().toLowerCase();
  if (SPAM_KEYWORDS.some(keyword => urlLower.includes(keyword))) {
    return new Response('Not Found', { status: 404 });
  }

  // Rate limiting
  const key = `rate_limit:${ip}`;
  const requests = await context.env.get(key) || '0:0'; // format: "count:timestamp"
  const [countStr = '0', timestampStr = '0'] = requests.split(':');
  let count = parseInt(countStr, 10);
  let timestamp = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);

  // Reset counter if outside the current minute
  if (now - timestamp >= 60) {
    count = 0;
    timestamp = now;
  }

  // Check if IP is currently blocked
  const blockKey = `blocked:${ip}`;
  const blocked = await context.env.get(blockKey);
  if (blocked) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Increment request counter
  count++;
  await context.env.set(key, `${count}:${timestamp}`);

  // Block IP if rate limit exceeded
  if (count > RATE_LIMIT) {
    await context.env.set(blockKey, 'true', { ttl: BLOCK_DURATION });
    return new Response('Too Many Requests', { status: 429 });
  }

  // Continue to the application
  return context.next();
};
