export async function GET() {
  const script = `
window.__SUPA_URL__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')};
window.__SUPA_KEY__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')};
`.trim();

  return new Response(script, {
    headers: { 'Content-Type': 'application/javascript' },
  });
}
