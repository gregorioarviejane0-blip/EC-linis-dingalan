export interface PurokLocation {
  name: string;
  purokNumber: string;
  description: string;
  xPct: number; // percentage coordinate on Dingalan Map (x: 0-100)
  yPct: number; // percentage coordinate on Dingalan Map (y: 0-100)
}

export const DINGALAN_BARANGAY_PUROKS: Record<string, PurokLocation[]> = {
  Paltic: [
    { name: 'Purok 1 - Feeder Port Wharf & Berth', purokNumber: 'Purok 1', description: 'Feeder Port Wharf Zone', xPct: 68, yPct: 38 },
    { name: 'Purok 2 - Paltic Rock Sea Wall', purokNumber: 'Purok 2', description: 'Coastal Rock Armoring Zone', xPct: 72, yPct: 42 },
    { name: 'Purok 3 - Coastal Boulevard Road', purokNumber: 'Purok 3', description: 'Main Coastal Access Road', xPct: 64, yPct: 45 },
    { name: 'Purok 4 - Dingalan Lighthouse Trail Base', purokNumber: 'Purok 4', description: 'Mountain & Lighthouse Base', xPct: 75, yPct: 35 },
    { name: 'Purok 5 - Paltic Central Proper', purokNumber: 'Purok 5', description: 'Residential & Barangay Hall', xPct: 62, yPct: 38 },
    { name: 'Purok 6 - Paltic White Beach Front', purokNumber: 'Purok 6', description: 'Shoreline Beach Zone', xPct: 70, yPct: 48 },
    { name: 'Purok 7 - North Port Access Way', purokNumber: 'Purok 7', description: 'Northern Wharf Perimeter', xPct: 66, yPct: 34 },
  ],
  Aplaya: [
    { name: 'Purok 1 - Aplaya Estuary Bridge', purokNumber: 'Purok 1', description: 'River Bridge & Estuary', xPct: 50, yPct: 46 },
    { name: 'Purok 2 - Mangrove Rehabilitation Sanctuary', purokNumber: 'Purok 2', description: 'Intertidal Mangrove Zone', xPct: 55, yPct: 52 },
    { name: 'Purok 3 - Aplaya Shoreline Cleanup Area', purokNumber: 'Purok 3', description: 'Central Shoreline Access', xPct: 54, yPct: 49 },
    { name: 'Purok 4 - Coastal Drift Garbage Zone', purokNumber: 'Purok 4', description: 'South Intertidal Zone', xPct: 56, yPct: 54 },
    { name: 'Purok 5 - Aplaya Barangay Hall & Center', purokNumber: 'Purok 5', description: 'Aplaya Barangay Proper', xPct: 48, yPct: 48 },
  ],
  Poblacion: [
    { name: 'Purok 1 - Municipal Hall & Plaza Perimeter', purokNumber: 'Purok 1', description: 'LGU Municipal Hall Plaza', xPct: 44, yPct: 33 },
    { name: 'Purok 2 - Main Drainage Arterials', purokNumber: 'Purok 2', description: 'Culvert & Canal Network', xPct: 46, yPct: 36 },
    { name: 'Purok 3 - Central Avenue Market Area', purokNumber: 'Purok 3', description: 'Public Market Access', xPct: 43, yPct: 38 },
    { name: 'Purok 4 - Poblacion Coastal Bay View', purokNumber: 'Purok 4', description: 'Bay Shoreline Boulevard', xPct: 47, yPct: 40 },
    { name: 'Purok 5 - Rizal Street Main Canal', purokNumber: 'Purok 5', description: 'Rizal Street Arterial Drain', xPct: 42, yPct: 35 },
  ],
  'Butas na Bato': [
    { name: 'Purok 1 - Butas na Bato Natural Rock Formation', purokNumber: 'Purok 1', description: 'Coastal Rock Formations', xPct: 35, yPct: 30 },
    { name: 'Purok 2 - Fisherman’s Landing Wharf', purokNumber: 'Purok 2', description: 'Landing Pier for Fisherfolk', xPct: 38, yPct: 32 },
    { name: 'Purok 3 - Ridge View & Cliffside Trail', purokNumber: 'Purok 3', description: 'Mountainous Coastal Ridge', xPct: 32, yPct: 28 },
  ],
  Cabischasan: [
    { name: 'Purok 1 - Cabischasan River Side', purokNumber: 'Purok 1', description: 'River Bank & Creek Bed', xPct: 30, yPct: 40 },
    { name: 'Purok 2 - Mountain Slope Slope Trail', purokNumber: 'Purok 2', description: 'Mountain Forest Slope', xPct: 28, yPct: 42 },
    { name: 'Purok 3 - Cabischasan Barangay Center', purokNumber: 'Purok 3', description: 'Barangay Proper Plaza', xPct: 32, yPct: 38 },
  ],
  Caragsacan: [
    { name: 'Purok 1 - Caragsacan Highway Junction', purokNumber: 'Purok 1', description: 'Main National Highway', xPct: 40, yPct: 50 },
    { name: 'Purok 2 - Caragsacan Shoreline Zone', purokNumber: 'Purok 2', description: 'Beach Shoreline Area', xPct: 42, yPct: 53 },
    { name: 'Purok 3 - Agricultural Belt Creek', purokNumber: 'Purok 3', description: 'Irrigation & Canal System', xPct: 38, yPct: 48 },
  ],
  Dingalan: [
    { name: 'Purok 1 - Dingalan Town Proper', purokNumber: 'Purok 1', description: 'Central Commercial Area', xPct: 45, yPct: 42 },
    { name: 'Purok 2 - Dingalan Bay Coastal Watch', purokNumber: 'Purok 2', description: 'Bay Shoreline Watch Tower', xPct: 48, yPct: 44 },
    { name: 'Purok 3 - Port Approach Way', purokNumber: 'Purok 3', description: 'Feeder Port Access Road', xPct: 46, yPct: 40 },
  ],
  Ibona: [
    { name: 'Purok 1 - Ibona River Delta', purokNumber: 'Purok 1', description: 'River Delta & Estuary', xPct: 20, yPct: 60 },
    { name: 'Purok 2 - Ibona Bridge & Highway', purokNumber: 'Purok 2', description: 'National Highway Bridge', xPct: 22, yPct: 58 },
    { name: 'Purok 3 - Ibona Coastal South', purokNumber: 'Purok 3', description: 'Southern Shoreline Area', xPct: 18, yPct: 62 },
  ],
  Matawe: [
    { name: 'Purok 1 - Matawe Intertidal Beach & Rock Formations', purokNumber: 'Purok 1', description: 'Rock Formations Beach', xPct: 82, yPct: 22 },
    { name: 'Purok 2 - Matawe Fisherman Village Shoreline', purokNumber: 'Purok 2', description: 'Fisherfolk Settlement', xPct: 84, yPct: 25 },
    { name: 'Purok 3 - Matawe Cove Access Trail', purokNumber: 'Purok 3', description: 'Coastal Cove Base', xPct: 80, yPct: 20 },
  ],
  Tanolong: [
    { name: 'Purok 1 - Tanolong Mangrove & Creek Zone', purokNumber: 'Purok 1', description: 'Creek & Mangrove Area', xPct: 26, yPct: 68 },
    { name: 'Purok 2 - Tanolong Coastal North', purokNumber: 'Purok 2', description: 'Northern Shoreline Zone', xPct: 28, yPct: 65 },
  ],
  Umiray: [
    { name: 'Purok 1 - Umiray River Mouth & Delta Boundary', purokNumber: 'Purok 1', description: 'River Mouth Delta Boundary', xPct: 15, yPct: 80 },
    { name: 'Purok 2 - Umiray Bridge & Boundary Marker', purokNumber: 'Purok 2', description: 'Provincial Boundary Bridge', xPct: 18, yPct: 78 },
    { name: 'Purok 3 - Umiray Coastal South Zone', purokNumber: 'Purok 3', description: 'Southernmost Shoreline', xPct: 12, yPct: 82 },
  ],
};

export function getPuroksByBarangay(barangayName: string): PurokLocation[] {
  if (!barangayName) return DINGALAN_BARANGAY_PUROKS['Paltic'] || [];
  const matchedKey = Object.keys(DINGALAN_BARANGAY_PUROKS).find(
    (key) => key.toLowerCase() === barangayName.toLowerCase() || barangayName.toLowerCase().includes(key.toLowerCase())
  );
  return matchedKey ? DINGALAN_BARANGAY_PUROKS[matchedKey] : DINGALAN_BARANGAY_PUROKS['Paltic'];
}
