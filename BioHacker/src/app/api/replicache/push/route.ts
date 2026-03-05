import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const pushRequest = await request.json();
  const { clientGroupID, mutations } = pushRequest;

  // Tenant Verification
  if (clientGroupID !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  for (const mutation of mutations) {
    const { name, args } = mutation;

    // Last-Write-Wins (LWW) Conflict Resolution via DB Overwrite
    if (name === 'createVial') {
      await supabase.from('vials').insert({
        id: args.id,
        user_id: session.user.id,
        encrypted_payload: JSON.stringify(args),
        remaining_volume_ml: args.remaining_volume_ml,
      });
    }

    if (name === 'logDose') {
      await supabase.from('dose_logs').insert({
        id: args.id,
        user_id: session.user.id,
        vial_id: args.vial_id,
        encrypted_payload: JSON.stringify(args),
        dosage_iu: args.dosage_iu,
      });
    }
  }

  return NextResponse.json({});
}
