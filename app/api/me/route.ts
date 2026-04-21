import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        email: user.email,
        name: user.user_metadata?.full_name
          || user.user_metadata?.name
          || user.email?.split('@')[0]
          || 'User',
      },
    });
  } catch {
    return Response.json({ user: null });
  }
}
