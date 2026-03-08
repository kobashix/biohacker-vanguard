import { Vial, Protocol, DoseLog, SubjectiveLog, Supply, Cycle } from "@/replicache";

export function generateDemoData() {
  const now = Date.now();
  const msPerDay = 24 * 3600 * 1000;

  // 1. Vials
  const testCId = crypto.randomUUID();
  const bpcId = crypto.randomUUID();
  const hghId = crypto.randomUUID();
  const tirzeId = crypto.randomUUID();
  const anavarId = crypto.randomUUID();

  const demoVials: Vial[] = [
    { 
      id: testCId, 
      name: 'Testosterone Cypionate', 
      compounds: [{ name: 'Testosterone Cypionate', mass_mg: 250, unit: 'mg' }],
      volume_ml: 10, 
      remaining_volume_ml: 6.4,
      status: 'mixed' 
    },
    { 
      id: bpcId,  
      name: 'BPC-157 5mg',            
      compounds: [{ name: 'BPC-157', mass_mg: 5, unit: 'mg' }],
      volume_ml: 2,  
      remaining_volume_ml: 1.2,
      status: 'mixed' 
    },
    { 
      id: hghId,  
      name: 'CJC-1295 + Ipamorelin',  
      compounds: [{ name: 'CJC/Ipam', mass_mg: 10, unit: 'mg' }],
      volume_ml: 5,  
      remaining_volume_ml: 4.1,
      status: 'mixed' 
    },
    { 
      id: tirzeId, 
      name: 'Tirzepatide 5mg',       
      compounds: [{ name: 'Tirzepatide', mass_mg: 5, unit: 'mg' }],
      volume_ml: 2,  
      remaining_volume_ml: 1.5,
      status: 'mixed' 
    },
    { 
      id: anavarId, 
      name: 'Anavar 10mg (Oral)',   
      compounds: [{ name: 'Oxandrolone', mass_mg: 10, unit: 'mg' }],
      volume_ml: 50, 
      remaining_volume_ml: 0,
      status: 'pill',
      pill_count: 32
    },
  ];

  // 2. Protocols
  const demoProtocols: Protocol[] = [
    { 
      id: crypto.randomUUID(), 
      vial_id: testCId, 
      dose_amount: 0.3, 
      dose_unit: 'mL',
      frequency_hours: 168, // weekly
      start_time: now - (90 * msPerDay)
    },
    { 
      id: crypto.randomUUID(), 
      vial_id: bpcId,   
      dose_amount: 250, 
      dose_unit: 'mcg',
      frequency_hours: 24, // daily
      start_time: now - (30 * msPerDay)
    },
    { 
      id: crypto.randomUUID(), 
      vial_id: hghId,   
      dose_amount: 100, 
      dose_unit: 'mcg',
      frequency_hours: 24, // daily
      start_time: now - (30 * msPerDay)
    },
    { 
      id: crypto.randomUUID(), 
      vial_id: tirzeId, 
      dose_amount: 2.5, 
      dose_unit: 'mg',
      frequency_hours: 168, // weekly
      start_time: now - (14 * msPerDay)
    },
  ];

  // 3. Dose Logs (last 30 days)
  const demoLogs: DoseLog[] = [];
  for (let i = 30; i >= 0; i--) {
    const ts = now - (i * msPerDay);
    if (i % 3 === 0) {
      demoLogs.push({ id: crypto.randomUUID(), vial_id: testCId, substance: 'Testosterone Cypionate', dose_amount: 75, unit: 'mg', units_iu: 30, timestamp: ts + 9 * 3600000 });
    }
    demoLogs.push({ id: crypto.randomUUID(), vial_id: bpcId, substance: 'BPC-157 5mg', dose_amount: 250, unit: 'mcg', units_iu: 10, timestamp: ts + 8 * 3600000 });
    if (i % 7 !== 0) {
      demoLogs.push({ id: crypto.randomUUID(), vial_id: hghId, substance: 'CJC-1295 + Ipamorelin', dose_amount: 100, unit: 'mcg', units_iu: 10, timestamp: ts + 21 * 3600000 });
    }
    if (i % 7 === 0) {
      demoLogs.push({ id: crypto.randomUUID(), vial_id: tirzeId, substance: 'Tirzepatide 5mg', dose_amount: 2500, unit: 'mcg', units_iu: 25, timestamp: ts + 8 * 3600000 });
    }
    demoLogs.push({ id: crypto.randomUUID(), vial_id: anavarId, substance: 'Anavar 10mg (Oral)', dose_amount: 2, unit: 'tabs', units_iu: 0, timestamp: ts + 12 * 3600000 });
  }

  // 4. Wellbeing Logs
  const subjectiveLogs: SubjectiveLog[] = [];
  for (let i = 30; i >= 0; i--) {
    const weekProgress = (30 - i) / 30;
    subjectiveLogs.push({
      id: crypto.randomUUID(),
      timestamp: now - (i * msPerDay) + 8 * 3600000,
      mood: Math.min(10, Math.max(1, Math.round(5 + weekProgress * 3))),
      energy: Math.min(10, Math.max(1, Math.round(5 + weekProgress * 3.5))),
      sleep_quality: Math.min(10, Math.max(1, Math.round(6 + weekProgress * 2))),
      soreness: Math.min(10, Math.max(1, Math.round(5 - weekProgress * 3))),
      notes: i % 5 === 0 ? ['Great pump today.', 'PIP minimal.', 'Energy through the roof.', 'Appetite way down.', 'Recovery feeling dialed in.'][i / 5 | 0] : '',
    });
  }

  // 5. Supplies
  const demoSupplies: Supply[] = [
    { id: crypto.randomUUID(), name: '31G Insulin Syringes', count: 87, unit: 'pcs' },
    { id: crypto.randomUUID(), name: 'Alcohol Prep Pads', count: 143, unit: 'pcs' },
    { id: crypto.randomUUID(), name: 'Bacteriostatic Water 30mL', count: 3, unit: 'vials' },
  ];

  // 6. Cycles
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const demoCycles: Cycle[] = [
    {
      id: crypto.randomUUID(),
      name: '🏋️ Winter Bulk',
      start_date: fmt(new Date(now - 120 * msPerDay)),
      end_date: fmt(new Date(now - 30 * msPerDay)),
      vial_ids: [testCId, anavarId],
      notes: 'Gained 14lbs.',
    },
    {
      id: crypto.randomUUID(),
      name: '🔄 TRT + Peptides Cruise',
      start_date: fmt(new Date(now - 31 * msPerDay)),
      vial_ids: [testCId, bpcId, hghId, tirzeId],
      notes: 'Current maintenance protocol.',
    }
  ];

  return { demoVials, demoProtocols, demoLogs, subjectiveLogs, demoSupplies, demoCycles };
}
