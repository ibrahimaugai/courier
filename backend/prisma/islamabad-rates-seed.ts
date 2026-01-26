import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// City codes mapping
const CITY_CODES = {
  ISLAMABAD: 'ISB',
  NAROWAL: 'NRL',
  GUJRANWALA: 'GUJ',
  LAHORE: 'LHE',
  SIALKOT: 'SLT',
  KARACHI: 'KCH',
};

// Service names mapping
const SERVICE_NAMES = {
  'OVER NIGHT': 'Over Night',
  'FLYER': 'L-Flayer',
  'ECONOMY': 'Economy',
  'BLUE BOX': 'Blue Box',
  'ON TIME SERVICE': 'On Time Service',
};

// Pricing data structure
interface PricingData {
  route: string;
  weight: number;
  services: {
    [key: string]: number | null;
  };
}

// Islamabad to Islamabad pricing data
const islamabadToIslamabad: PricingData[] = [
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 0.5, services: { 'OVER NIGHT': 245, 'FLYER': 285, 'ECONOMY': null, 'BLUE BOX': 300, 'ON TIME SERVICE': 410 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 1, services: { 'OVER NIGHT': 305, 'FLYER': 320, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 490 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 2, services: { 'OVER NIGHT': 565, 'FLYER': 600, 'ECONOMY': null, 'BLUE BOX': 520, 'ON TIME SERVICE': 1080 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 3, services: { 'OVER NIGHT': 825, 'FLYER': 880, 'ECONOMY': null, 'BLUE BOX': 780, 'ON TIME SERVICE': 1360 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 4, services: { 'OVER NIGHT': 1085, 'FLYER': 1160, 'ECONOMY': null, 'BLUE BOX': 870, 'ON TIME SERVICE': 1830 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 5, services: { 'OVER NIGHT': 1345, 'FLYER': 1440, 'ECONOMY': null, 'BLUE BOX': 970, 'ON TIME SERVICE': 2010 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 6, services: { 'OVER NIGHT': 1605, 'FLYER': 1720, 'ECONOMY': null, 'BLUE BOX': 1170, 'ON TIME SERVICE': 2400 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 7, services: { 'OVER NIGHT': 1865, 'FLYER': 2000, 'ECONOMY': null, 'BLUE BOX': 1360, 'ON TIME SERVICE': 2790 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 8, services: { 'OVER NIGHT': 2125, 'FLYER': 2280, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 3080 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 9, services: { 'OVER NIGHT': 2385, 'FLYER': 2560, 'ECONOMY': null, 'BLUE BOX': 1570, 'ON TIME SERVICE': 3250 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 10, services: { 'OVER NIGHT': 2645, 'FLYER': 2840, 'ECONOMY': null, 'BLUE BOX': 1670, 'ON TIME SERVICE': 3350 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 11, services: { 'OVER NIGHT': 2905, 'FLYER': 3120, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3490 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 12, services: { 'OVER NIGHT': 3165, 'FLYER': 3400, 'ECONOMY': null, 'BLUE BOX': 1880, 'ON TIME SERVICE': 3650 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 13, services: { 'OVER NIGHT': 3425, 'FLYER': 3680, 'ECONOMY': null, 'BLUE BOX': 2060, 'ON TIME SERVICE': 3750 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 14, services: { 'OVER NIGHT': 3685, 'FLYER': 3960, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 3850 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 15, services: { 'OVER NIGHT': 3945, 'FLYER': 4240, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 3950 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 16, services: { 'OVER NIGHT': 4205, 'FLYER': 4520, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 4050 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 17, services: { 'OVER NIGHT': 4465, 'FLYER': 4800, 'ECONOMY': null, 'BLUE BOX': 2450, 'ON TIME SERVICE': 4150 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 18, services: { 'OVER NIGHT': 4725, 'FLYER': 5080, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 4250 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 19, services: { 'OVER NIGHT': 4985, 'FLYER': 5360, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 4350 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 20, services: { 'OVER NIGHT': 5245, 'FLYER': 5640, 'ECONOMY': null, 'BLUE BOX': 2750, 'ON TIME SERVICE': 4450 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 21, services: { 'OVER NIGHT': 5505, 'FLYER': 5920, 'ECONOMY': null, 'BLUE BOX': 2850, 'ON TIME SERVICE': 4550 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 22, services: { 'OVER NIGHT': 5765, 'FLYER': 6200, 'ECONOMY': null, 'BLUE BOX': 2950, 'ON TIME SERVICE': 4650 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 23, services: { 'OVER NIGHT': 6025, 'FLYER': 6480, 'ECONOMY': null, 'BLUE BOX': 3050, 'ON TIME SERVICE': 4750 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 24, services: { 'OVER NIGHT': 6285, 'FLYER': 6760, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 4850 } },
  { route: 'ISLAMABAD_TO_ISLAMABAD', weight: 25, services: { 'OVER NIGHT': 6545, 'FLYER': 7040, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 4950 } },
];

// Islamabad to Narowal pricing data
const islamabadToNarowal: PricingData[] = [
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 0.5, services: { 'OVER NIGHT': 545, 'FLYER': 610, 'ECONOMY': null, 'BLUE BOX': 550, 'ON TIME SERVICE': 720 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 1, services: { 'OVER NIGHT': 685, 'FLYER': 690, 'ECONOMY': null, 'BLUE BOX': 650, 'ON TIME SERVICE': 810 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 2, services: { 'OVER NIGHT': 1045, 'FLYER': 1150, 'ECONOMY': null, 'BLUE BOX': 800, 'ON TIME SERVICE': 1390 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 3, services: { 'OVER NIGHT': 1405, 'FLYER': 1610, 'ECONOMY': null, 'BLUE BOX': 1200, 'ON TIME SERVICE': 1970 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 4, services: { 'OVER NIGHT': 1765, 'FLYER': 2070, 'ECONOMY': null, 'BLUE BOX': 1540, 'ON TIME SERVICE': 2550 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2530, 'ECONOMY': null, 'BLUE BOX': 1700, 'ON TIME SERVICE': 3130 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 6, services: { 'OVER NIGHT': 2485, 'FLYER': 2990, 'ECONOMY': null, 'BLUE BOX': 2000, 'ON TIME SERVICE': 3710 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 7, services: { 'OVER NIGHT': 2845, 'FLYER': 3450, 'ECONOMY': null, 'BLUE BOX': 2100, 'ON TIME SERVICE': 4290 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 8, services: { 'OVER NIGHT': 3205, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2200, 'ON TIME SERVICE': 4870 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 9, services: { 'OVER NIGHT': 3565, 'FLYER': 4350, 'ECONOMY': null, 'BLUE BOX': 2300, 'ON TIME SERVICE': 5450 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 10, services: { 'OVER NIGHT': 3925, 'FLYER': 4750, 'ECONOMY': null, 'BLUE BOX': 2400, 'ON TIME SERVICE': 6000 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 11, services: { 'OVER NIGHT': 4285, 'FLYER': 5250, 'ECONOMY': null, 'BLUE BOX': 2500, 'ON TIME SERVICE': 6610 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 12, services: { 'OVER NIGHT': 4645, 'FLYER': 5750, 'ECONOMY': null, 'BLUE BOX': 2700, 'ON TIME SERVICE': 7190 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 13, services: { 'OVER NIGHT': 5005, 'FLYER': 6150, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 7770 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 14, services: { 'OVER NIGHT': 5365, 'FLYER': 6650, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 8350 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 15, services: { 'OVER NIGHT': 5725, 'FLYER': 7050, 'ECONOMY': null, 'BLUE BOX': 3300, 'ON TIME SERVICE': 8900 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 16, services: { 'OVER NIGHT': 6085, 'FLYER': 7550, 'ECONOMY': null, 'BLUE BOX': 3400, 'ON TIME SERVICE': 9500 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 17, services: { 'OVER NIGHT': 6445, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3500, 'ON TIME SERVICE': 10100 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 18, services: { 'OVER NIGHT': 6805, 'FLYER': 8450, 'ECONOMY': null, 'BLUE BOX': 3600, 'ON TIME SERVICE': 10650 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 19, services: { 'OVER NIGHT': 7165, 'FLYER': 8950, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 11350 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 20, services: { 'OVER NIGHT': 7525, 'FLYER': 9350, 'ECONOMY': null, 'BLUE BOX': 3900, 'ON TIME SERVICE': 11850 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 21, services: { 'OVER NIGHT': 7885, 'FLYER': 9850, 'ECONOMY': null, 'BLUE BOX': 4000, 'ON TIME SERVICE': 12450 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 22, services: { 'OVER NIGHT': 8245, 'FLYER': 10350, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 13050 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 23, services: { 'OVER NIGHT': 8605, 'FLYER': 10750, 'ECONOMY': null, 'BLUE BOX': 4200, 'ON TIME SERVICE': 13650 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 24, services: { 'OVER NIGHT': 8965, 'FLYER': 11250, 'ECONOMY': null, 'BLUE BOX': 4300, 'ON TIME SERVICE': 14150 } },
  { route: 'ISLAMABAD_TO_NAROWAL', weight: 25, services: { 'OVER NIGHT': 9325, 'FLYER': 11750, 'ECONOMY': null, 'BLUE BOX': 4400, 'ON TIME SERVICE': 14650 } },
];

// Islamabad to Gujranwala pricing data
const islamabadToGujranwala: PricingData[] = [
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 0.5, services: { 'OVER NIGHT': 465, 'FLYER': 510, 'ECONOMY': null, 'BLUE BOX': 600, 'ON TIME SERVICE': 650 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 1, services: { 'OVER NIGHT': 595, 'FLYER': 580, 'ECONOMY': null, 'BLUE BOX': 700, 'ON TIME SERVICE': 750 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 2, services: { 'OVER NIGHT': 1015, 'FLYER': 960, 'ECONOMY': null, 'BLUE BOX': 820, 'ON TIME SERVICE': 1300 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 3, services: { 'OVER NIGHT': 1435, 'FLYER': 1340, 'ECONOMY': null, 'BLUE BOX': 1060, 'ON TIME SERVICE': 1850 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 4, services: { 'OVER NIGHT': 1855, 'FLYER': 1720, 'ECONOMY': null, 'BLUE BOX': 1360, 'ON TIME SERVICE': 2300 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 5, services: { 'OVER NIGHT': 2275, 'FLYER': 2100, 'ECONOMY': null, 'BLUE BOX': 1550, 'ON TIME SERVICE': 2900 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 6, services: { 'OVER NIGHT': 2695, 'FLYER': 2480, 'ECONOMY': null, 'BLUE BOX': 1820, 'ON TIME SERVICE': 3200 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 7, services: { 'OVER NIGHT': 3115, 'FLYER': 2860, 'ECONOMY': null, 'BLUE BOX': 2100, 'ON TIME SERVICE': 3500 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 8, services: { 'OVER NIGHT': 3535, 'FLYER': 3240, 'ECONOMY': null, 'BLUE BOX': 2200, 'ON TIME SERVICE': 3800 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 9, services: { 'OVER NIGHT': 3955, 'FLYER': 3620, 'ECONOMY': null, 'BLUE BOX': 2300, 'ON TIME SERVICE': 4100 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 10, services: { 'OVER NIGHT': 4375, 'FLYER': 4000, 'ECONOMY': null, 'BLUE BOX': 2400, 'ON TIME SERVICE': 4400 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 11, services: { 'OVER NIGHT': 4795, 'FLYER': 4380, 'ECONOMY': null, 'BLUE BOX': 2500, 'ON TIME SERVICE': 4700 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 12, services: { 'OVER NIGHT': 5215, 'FLYER': 4760, 'ECONOMY': null, 'BLUE BOX': 2600, 'ON TIME SERVICE': 5000 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 13, services: { 'OVER NIGHT': 5635, 'FLYER': 5140, 'ECONOMY': null, 'BLUE BOX': 2700, 'ON TIME SERVICE': 5300 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 14, services: { 'OVER NIGHT': 6055, 'FLYER': 5520, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 5700 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 15, services: { 'OVER NIGHT': 6475, 'FLYER': 5900, 'ECONOMY': null, 'BLUE BOX': 3100, 'ON TIME SERVICE': 6000 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 16, services: { 'OVER NIGHT': 6895, 'FLYER': 6280, 'ECONOMY': null, 'BLUE BOX': 3300, 'ON TIME SERVICE': 6300 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 17, services: { 'OVER NIGHT': 7315, 'FLYER': 6660, 'ECONOMY': null, 'BLUE BOX': 3500, 'ON TIME SERVICE': 6600 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 18, services: { 'OVER NIGHT': 7735, 'FLYER': 7040, 'ECONOMY': null, 'BLUE BOX': 3600, 'ON TIME SERVICE': 6900 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 19, services: { 'OVER NIGHT': 8155, 'FLYER': 7420, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 7200 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 20, services: { 'OVER NIGHT': 8575, 'FLYER': 7800, 'ECONOMY': null, 'BLUE BOX': 3800, 'ON TIME SERVICE': 7650 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 21, services: { 'OVER NIGHT': 8995, 'FLYER': 8180, 'ECONOMY': null, 'BLUE BOX': 3900, 'ON TIME SERVICE': 7950 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 22, services: { 'OVER NIGHT': 9415, 'FLYER': 8560, 'ECONOMY': null, 'BLUE BOX': 4000, 'ON TIME SERVICE': 8250 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 23, services: { 'OVER NIGHT': 9835, 'FLYER': 8940, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 8550 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 24, services: { 'OVER NIGHT': 10255, 'FLYER': 9320, 'ECONOMY': null, 'BLUE BOX': 4200, 'ON TIME SERVICE': 8850 } },
  { route: 'ISLAMABAD_TO_GUJRANWALA', weight: 25, services: { 'OVER NIGHT': 10675, 'FLYER': 9700, 'ECONOMY': null, 'BLUE BOX': 4300, 'ON TIME SERVICE': 9550 } },
];

// Islamabad to Lahore pricing data
const islamabadToLahore: PricingData[] = [
  { route: 'ISLAMABAD_TO_LAHORE', weight: 0.5, services: { 'OVER NIGHT': 545, 'FLYER': 610, 'ECONOMY': null, 'BLUE BOX': 550, 'ON TIME SERVICE': 720 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 1, services: { 'OVER NIGHT': 685, 'FLYER': 690, 'ECONOMY': null, 'BLUE BOX': 650, 'ON TIME SERVICE': 810 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 2, services: { 'OVER NIGHT': 1045, 'FLYER': 1150, 'ECONOMY': null, 'BLUE BOX': 800, 'ON TIME SERVICE': 1390 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 3, services: { 'OVER NIGHT': 1405, 'FLYER': 1610, 'ECONOMY': null, 'BLUE BOX': 1200, 'ON TIME SERVICE': 1970 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 4, services: { 'OVER NIGHT': 1765, 'FLYER': 2070, 'ECONOMY': null, 'BLUE BOX': 1540, 'ON TIME SERVICE': 2550 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2530, 'ECONOMY': null, 'BLUE BOX': 1700, 'ON TIME SERVICE': 3130 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 6, services: { 'OVER NIGHT': 2485, 'FLYER': 2990, 'ECONOMY': null, 'BLUE BOX': 2000, 'ON TIME SERVICE': 3710 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 7, services: { 'OVER NIGHT': 2845, 'FLYER': 3450, 'ECONOMY': null, 'BLUE BOX': 2100, 'ON TIME SERVICE': 4290 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 8, services: { 'OVER NIGHT': 3205, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2200, 'ON TIME SERVICE': 4870 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 9, services: { 'OVER NIGHT': 3565, 'FLYER': 4350, 'ECONOMY': null, 'BLUE BOX': 2300, 'ON TIME SERVICE': 5450 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 10, services: { 'OVER NIGHT': 3925, 'FLYER': 4750, 'ECONOMY': null, 'BLUE BOX': 2400, 'ON TIME SERVICE': 6000 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 11, services: { 'OVER NIGHT': 4285, 'FLYER': 5250, 'ECONOMY': null, 'BLUE BOX': 2500, 'ON TIME SERVICE': 6610 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 12, services: { 'OVER NIGHT': 4645, 'FLYER': 5750, 'ECONOMY': null, 'BLUE BOX': 2700, 'ON TIME SERVICE': 7190 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 13, services: { 'OVER NIGHT': 5005, 'FLYER': 6150, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 7770 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 14, services: { 'OVER NIGHT': 5365, 'FLYER': 6650, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 8350 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 15, services: { 'OVER NIGHT': 5725, 'FLYER': 7050, 'ECONOMY': null, 'BLUE BOX': 3300, 'ON TIME SERVICE': 8900 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 16, services: { 'OVER NIGHT': 6085, 'FLYER': 7550, 'ECONOMY': null, 'BLUE BOX': 3400, 'ON TIME SERVICE': 9500 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 17, services: { 'OVER NIGHT': 6445, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3500, 'ON TIME SERVICE': 10100 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 18, services: { 'OVER NIGHT': 6805, 'FLYER': 8450, 'ECONOMY': null, 'BLUE BOX': 3600, 'ON TIME SERVICE': 10650 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 19, services: { 'OVER NIGHT': 7165, 'FLYER': 8950, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 11350 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 20, services: { 'OVER NIGHT': 7525, 'FLYER': 9350, 'ECONOMY': null, 'BLUE BOX': 3900, 'ON TIME SERVICE': 11850 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 21, services: { 'OVER NIGHT': 7885, 'FLYER': 9850, 'ECONOMY': null, 'BLUE BOX': 4000, 'ON TIME SERVICE': 12450 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 22, services: { 'OVER NIGHT': 8245, 'FLYER': 10350, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 13050 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 23, services: { 'OVER NIGHT': 8605, 'FLYER': 10750, 'ECONOMY': null, 'BLUE BOX': 4200, 'ON TIME SERVICE': 13650 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 24, services: { 'OVER NIGHT': 8965, 'FLYER': 11250, 'ECONOMY': null, 'BLUE BOX': 4300, 'ON TIME SERVICE': 14150 } },
  { route: 'ISLAMABAD_TO_LAHORE', weight: 25, services: { 'OVER NIGHT': 9325, 'FLYER': 11750, 'ECONOMY': null, 'BLUE BOX': 4400, 'ON TIME SERVICE': 14650 } },
];

// Islamabad to Sialkot pricing data
const islamabadToSialkot: PricingData[] = [
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 0.5, services: { 'OVER NIGHT': 395, 'FLYER': 460, 'ECONOMY': null, 'BLUE BOX': 400, 'ON TIME SERVICE': 570 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 1, services: { 'OVER NIGHT': 535, 'FLYER': 540, 'ECONOMY': null, 'BLUE BOX': 500, 'ON TIME SERVICE': 660 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 2, services: { 'OVER NIGHT': 895, 'FLYER': 1000, 'ECONOMY': null, 'BLUE BOX': 650, 'ON TIME SERVICE': 1240 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 3, services: { 'OVER NIGHT': 1255, 'FLYER': 1460, 'ECONOMY': null, 'BLUE BOX': 1050, 'ON TIME SERVICE': 1820 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 4, services: { 'OVER NIGHT': 1615, 'FLYER': 1920, 'ECONOMY': null, 'BLUE BOX': 1390, 'ON TIME SERVICE': 2400 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 5, services: { 'OVER NIGHT': 1975, 'FLYER': 2380, 'ECONOMY': null, 'BLUE BOX': 1550, 'ON TIME SERVICE': 2980 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 6, services: { 'OVER NIGHT': 2335, 'FLYER': 2840, 'ECONOMY': null, 'BLUE BOX': 1850, 'ON TIME SERVICE': 3560 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 7, services: { 'OVER NIGHT': 2695, 'FLYER': 3300, 'ECONOMY': null, 'BLUE BOX': 1950, 'ON TIME SERVICE': 4140 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 8, services: { 'OVER NIGHT': 3055, 'FLYER': 3700, 'ECONOMY': null, 'BLUE BOX': 2050, 'ON TIME SERVICE': 4720 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 9, services: { 'OVER NIGHT': 3415, 'FLYER': 4200, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 5300 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 10, services: { 'OVER NIGHT': 3775, 'FLYER': 4600, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 5850 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 11, services: { 'OVER NIGHT': 4135, 'FLYER': 5100, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 6460 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 12, services: { 'OVER NIGHT': 4495, 'FLYER': 5600, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 7040 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 13, services: { 'OVER NIGHT': 4855, 'FLYER': 6000, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 7620 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 14, services: { 'OVER NIGHT': 5215, 'FLYER': 6500, 'ECONOMY': null, 'BLUE BOX': 2750, 'ON TIME SERVICE': 8200 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 15, services: { 'OVER NIGHT': 5575, 'FLYER': 6900, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 8750 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 16, services: { 'OVER NIGHT': 5935, 'FLYER': 7400, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 9350 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 17, services: { 'OVER NIGHT': 6295, 'FLYER': 7900, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 9950 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 18, services: { 'OVER NIGHT': 6655, 'FLYER': 8300, 'ECONOMY': null, 'BLUE BOX': 3450, 'ON TIME SERVICE': 10500 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 19, services: { 'OVER NIGHT': 7015, 'FLYER': 8800, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 11200 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 20, services: { 'OVER NIGHT': 7375, 'FLYER': 9200, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 11700 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 21, services: { 'OVER NIGHT': 7735, 'FLYER': 9700, 'ECONOMY': null, 'BLUE BOX': 3850, 'ON TIME SERVICE': 12300 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 22, services: { 'OVER NIGHT': 8095, 'FLYER': 10200, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 12900 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 23, services: { 'OVER NIGHT': 8455, 'FLYER': 10600, 'ECONOMY': null, 'BLUE BOX': 4050, 'ON TIME SERVICE': 13500 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 24, services: { 'OVER NIGHT': 8815, 'FLYER': 11100, 'ECONOMY': null, 'BLUE BOX': 4150, 'ON TIME SERVICE': 14000 } },
  { route: 'ISLAMABAD_TO_SIALKOT', weight: 25, services: { 'OVER NIGHT': 9175, 'FLYER': 11600, 'ECONOMY': null, 'BLUE BOX': 4250, 'ON TIME SERVICE': 14500 } },
];

// Helper function to get or create a city
async function getOrCreateCity(cityCode: string, cityName: string) {
  let city = await prisma.city.findUnique({
    where: { cityCode },
  });

  if (!city) {
    city = await prisma.city.create({
      data: {
        cityCode,
        cityName,
        status: 'active',
      },
    });
    console.log(`Created city: ${cityName} (${cityCode})`);
  }

  return city;
}

// Helper function to get or create a service
async function getOrCreateService(serviceName: string) {
  // Generate service code from service name
  const serviceCode = serviceName.toUpperCase().replace(/[\s-]+/g, '_').substring(0, 30);

  let service = await prisma.service.findFirst({
    where: {
      OR: [
        { serviceCode },
        { serviceName: { equals: serviceName, mode: 'insensitive' } },
      ],
    },
  });

  if (!service) {
    service = await prisma.service.create({
      data: {
        serviceCode,
        serviceName,
        serviceType: 'General',
        status: 'active',
      },
    });
    console.log(`Created service: ${serviceName} (${serviceCode})`);
  } else if (service.serviceType !== 'General') {
    service = await prisma.service.update({
      where: { id: service.id },
      data: { serviceType: 'General' }
    });
    console.log(`Updated service type: ${serviceName} -> General`);
  }

  return service;
}

// Helper function to create pricing rules
async function createPricingRules(
  originCityCode: string,
  destinationCityCode: string,
  pricingData: PricingData[]
) {
  const originCity = await getOrCreateCity(originCityCode, getCityName(originCityCode));
  const destinationCity = await getOrCreateCity(destinationCityCode, getCityName(destinationCityCode));

  const effectiveFrom = new Date();
  let createdCount = 0;
  let skippedCount = 0;

  // Sort pricing data by weight to ensure correct range calculation
  const sortedData = [...pricingData].sort((a, b) => a.weight - b.weight);

  for (let i = 0; i < sortedData.length; i++) {
    const data = sortedData[i];
    // Calculate weight range: from previous weight to current weight
    const weightFrom = i === 0 ? 0 : sortedData[i - 1].weight;
    const weightTo = data.weight;

    for (const [serviceKey, rate] of Object.entries(data.services)) {
      if (rate === null) continue; // Skip null rates

      const serviceName = SERVICE_NAMES[serviceKey as keyof typeof SERVICE_NAMES];
      if (!serviceName) {
        console.warn(`Unknown service: ${serviceKey}`);
        continue;
      }

      const service = await getOrCreateService(serviceName);

      // Check if pricing rule already exists
      const existingRule = await prisma.pricingRule.findFirst({
        where: {
          originCityId: originCity.id,
          destinationCityId: destinationCity.id,
          serviceId: service.id,
          weightFrom: { gte: weightFrom },
          weightTo: { lte: weightTo },
        },
      });

      if (existingRule) {
        skippedCount++;
        continue;
      }

      // Create pricing rule
      await prisma.pricingRule.create({
        data: {
          originCityId: originCity.id,
          destinationCityId: destinationCity.id,
          serviceId: service.id,
          weightFrom,
          weightTo,
          ratePerKg: 0, // Base rate pricing, not per kg
          baseRate: rate,
          additionalCharges: null,
          status: 'active',
          effectiveFrom,
        },
      });

      createdCount++;
    }
  }

  console.log(
    `Route ${originCityCode} -> ${destinationCityCode}: Created ${createdCount} rules, skipped ${skippedCount} duplicates`
  );
}

// Helper function to get city name from code
function getCityName(cityCode: string): string {
  const cityNames: { [key: string]: string } = {
    ISB: 'Islamabad',
    NRL: 'Narowal',
    GUJ: 'Gujranwala',
    LHE: 'Lahore',
    SLT: 'Sialkot',
    KCH: 'Karachi',
  };
  return cityNames[cityCode] || cityCode;
}

async function main() {
  console.log('Starting Islamabad rates seeding...');

  try {
    // Seed all routes
    await createPricingRules(CITY_CODES.ISLAMABAD, CITY_CODES.ISLAMABAD, islamabadToIslamabad);
    await createPricingRules(CITY_CODES.ISLAMABAD, CITY_CODES.NAROWAL, islamabadToNarowal);
    await createPricingRules(CITY_CODES.ISLAMABAD, CITY_CODES.GUJRANWALA, islamabadToGujranwala);
    await createPricingRules(CITY_CODES.ISLAMABAD, CITY_CODES.LAHORE, islamabadToLahore);
    await createPricingRules(CITY_CODES.ISLAMABAD, CITY_CODES.SIALKOT, islamabadToSialkot);

    console.log('✅ Islamabad rates seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Islamabad rates:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
