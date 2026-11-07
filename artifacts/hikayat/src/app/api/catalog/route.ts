import { readSupabaseCatalog } from '@/infrastructure/server/supabase-catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await readSupabaseCatalog(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const code = error instanceof Error && /^supabase_[a-z0-9_]+$/.test(error.message)
      ? error.message : 'catalog_connection_or_schema_error';
    console.error('[catalog]', code);
    // Never expose upstream responses, connection details, or keys.
    return Response.json(
      { error: 'The fragrance catalog is unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
