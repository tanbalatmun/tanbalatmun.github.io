/*
 * TanMUN site configuration.
 *
 * Leave SUPABASE_URL / SUPABASE_ANON_KEY empty to run in DEMO MODE:
 * everything (content + applications) is stored in this browser only.
 * Fill them in (see README.md) to go live with a real database.
 */
window.TM_CONFIG = {
  SUPABASE_URL: "https://fhzdvrmbcpyexrcqsddw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemR2cm1iY3B5ZXhyY3FzZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTc2MTksImV4cCI6MjEwNjE5MzYxOX0.Qy5bYZ2A7doRyz9qu6KfLXMa7cdL6d0E386oF4V_X_g",

  // The single organizer account created in Supabase (Auth → Users).
  ORGANIZER_EMAIL: "organizer@tanmun.com",

  // Demo mode only (not needed once the database is connected).
  // PBKDF2-SHA256, 200k iterations, of the demo password.
  DEMO_PASSWORD_HASH: "",
  DEMO_PASSWORD_SALT: "tanmun-demo-salt",
};
