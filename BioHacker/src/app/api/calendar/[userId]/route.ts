import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as ics from 'ics';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch protocols and vials for this user
  const { data: protocols } = await supabase
    .from('protocols')
    .select('*, vials(*)')
    .eq('user_id', userId);

  if (!protocols || protocols.length === 0) {
    return new Response('No protocols found', { status: 404 });
  }

  const events: ics.EventAttributes[] = [];

  protocols.forEach((p: any) => {
    const vial = p.vials;
    const startDate = new Date(p.start_time);
    
    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(startDate.getTime() + (i * p.frequency_hours * 3600000));
      
      // Basic On/Off Logic
      const daysOn = p.days_on || 7;
      const daysOff = p.days_off || 0;
      const cycleDay = i % (daysOn + daysOff);
      
      if (cycleDay < daysOn) {
        events.push({
          start: [
            eventDate.getFullYear(),
            eventDate.getMonth() + 1,
            eventDate.getDate(),
            eventDate.getHours(),
            eventDate.getMinutes()
          ],
          duration: { minutes: 15 },
          title: `Dose: ${vial.name}`,
          description: `Administer ${p.dose_amount} ${vial.status === 'pill' ? 'pills' : 'mcg'}. Recorded via BioHacker (by MMM).`,
          categories: ['Medical', 'BioHacker'],
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          alarms: [
            { action: 'display', description: 'Reminder', trigger: { minutes: 5, before: true } }
          ]
        });
      }
    }
  });

  const { error, value } = ics.createEvents(events);

  if (error) {
    return new Response('Error generating calendar', { status: 500 });
  }

  return new Response(value, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="biohacker_protocol.ics"`
    }
  });
}
