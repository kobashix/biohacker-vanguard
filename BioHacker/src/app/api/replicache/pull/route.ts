import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

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

  // 1. JWT Verification
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const pullRequest = await request.json();
  const { clientGroupID, cookie } = pullRequest;

  // 2. Tenant Validation: clientGroupID must match the authenticated user_id
  if (clientGroupID !== session.user.id) {
    return new Response('Forbidden: Tenant Mismatch', { status: 403 });
  }

  // 3. Authenticated Data Fetching (Scoped by user_id)
  const { data: vials, error: vialsError } = await supabase
    .from('vials')
    .select('*')
    .eq('user_id', session.user.id);

  const { data: logs, error: logsError } = await supabase
    .from('dose_logs')
    .select('*')
    .eq('user_id', session.user.id);

  if (vialsError || logsError) {
    return new Response('Internal Server Error', { status: 500 });
  }

  // 4. Construct Replicache Patch (Simplified Diffing for LWW)
  const patch = [];
  
  // Clear local state if this is the first pull
  if (!cookie) {
    patch.push({ op: 'clear' });
  }

  vials.forEach((vial) => {
    patch.push({
      op: 'put',
      key: `vial/${vial.id}`,
      value: JSON.parse(vial.encrypted_payload),
    });
  });

  logs.forEach((log) => {
    patch.push({
      op: 'put',
      key: `log/${log.id}`,
      value: JSON.parse(log.encrypted_payload),
    });
  });

  return NextResponse.json({
    cookie: Date.now(), // Simplified versioning
    lastMutationID: 0, // Placeholder for actual mutation tracking
    patch,
  });
}
