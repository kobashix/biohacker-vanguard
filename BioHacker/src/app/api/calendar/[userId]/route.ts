import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as ics from 'ics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Fetch protocols and vials for this user
  const { data: protocols } = await supabase
    .from('protocols')
    .select('*, vials:vial_id(*)') // Corrected relation name
    .eq('user_id', userId);

  // If no protocols, return an empty but valid iCal feed
  if (!protocols || protocols.length === 0) {
    const { value } = ics.createEvents([]);
    return new Response(value || "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR", {
      headers: { 'Content-Type': 'text/calendar' }
    });
  }

  const events: ics.EventAttributes[] = [];

  protocols.forEach((p: any) => {
    const vial = p.vials;
    if (!vial) return;
    
    const startDate = new Date(p.start_time);
    
    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(startDate.getTime() + (i * p.frequency_hours * 3600000));
      
      const daysOn = p.days_on || 7;
      const daysOff = p.days_off || 0;
      const cycleLength = daysOn + daysOff;
      const cycleDay = i % cycleLength;
      
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
          description: `Administer ${p.dose_amount} ${vial.status === 'pill' ? 'pills' : 'mcg'}.`,
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
