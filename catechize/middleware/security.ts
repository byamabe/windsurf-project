export default defineEventHandler((event) => {
  // Set security headers
  setResponseHeaders(event, {
    // Content Security Policy
    'Content-Security-Policy': [
      // Default to none
      "default-src 'none'",
      // Scripts - allow self and nonce-based inline scripts
      "script-src 'self' 'unsafe-inline'",
      // Styles - allow self and inline styles for Tailwind
      "style-src 'self' 'unsafe-inline'",
      // Images - allow self and data URIs
      "img-src 'self' data: https:",
      // Media - allow common podcast hosting providers
      "media-src 'self' blob: https://*.supabase.co https://*.podbean.com https://*.buzzsprout.com https://*.libsyn.com https://*.soundcloud.com https://*.anchor.fm https://*.spotify.com https://*.megaphone.fm https://*.spreaker.com https://*.captivate.fm https://*.transistor.fm https://*.simplecast.com https://*.blubrry.com https://*.acast.com https://*.whooshkaa.com https://*.omnystudio.com https://*.ausha.co https://*.podcastics.com https://*.audioboom.com https://*.podtrac.com http://www.podtrac.com http://*.issuesetc.org https://*.issuesetc.org",
      // Fonts - allow self
      "font-src 'self'",
      // Connect - allow self and Supabase
      "connect-src 'self' https://*.supabase.co",
      // Frame ancestors - only allow Twitter
      "frame-ancestors 'self' https://twitter.com https://platform.twitter.com",
      // Base URI - restrict to self
      "base-uri 'self'",
      // Form actions - restrict to self
      "form-action 'self'",
    ].join('; '),
    // X-Content-Type-Options
    'X-Content-Type-Options': 'nosniff',
    // X-Frame-Options
    'X-Frame-Options': 'ALLOW-FROM https://twitter.com',
    // X-XSS-Protection
    'X-XSS-Protection': '1; mode=block',
    // Referrer-Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Strict-Transport-Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  })
})
