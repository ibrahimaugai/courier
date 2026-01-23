import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// City codes mapping
const CITY_CODES = {
  SIALKOT: 'SLT',
  NAROWAL: 'NRL',
  GUJRANWALA: 'GUJ',
  LAHORE: 'LHE',
  ISLAMABAD: 'ISB',
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

// Sialkot to Sialkot pricing data
const sialkotToSialkot: PricingData[] = [
  { route: 'SIALKOT_TO_SIALKOT', weight: 0.5, services: { 'OVER NIGHT': 245, 'FLYER': 285, 'ECONOMY': null, 'BLUE BOX': 300, 'ON TIME SERVICE': 410 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 1, services: { 'OVER NIGHT': 305, 'FLYER': 320, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 490 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 2, services: { 'OVER NIGHT': 565, 'FLYER': 600, 'ECONOMY': null, 'BLUE BOX': 520, 'ON TIME SERVICE': 1080 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 3, services: { 'OVER NIGHT': 825, 'FLYER': 880, 'ECONOMY': null, 'BLUE BOX': 780, 'ON TIME SERVICE': 1360 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 4, services: { 'OVER NIGHT': 1085, 'FLYER': 1160, 'ECONOMY': null, 'BLUE BOX': 870, 'ON TIME SERVICE': 1830 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 5, services: { 'OVER NIGHT': 1345, 'FLYER': 1440, 'ECONOMY': null, 'BLUE BOX': 970, 'ON TIME SERVICE': 2010 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 6, services: { 'OVER NIGHT': 1605, 'FLYER': 1720, 'ECONOMY': null, 'BLUE BOX': 1170, 'ON TIME SERVICE': 2400 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 7, services: { 'OVER NIGHT': 1865, 'FLYER': 2000, 'ECONOMY': null, 'BLUE BOX': 1360, 'ON TIME SERVICE': 2790 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 8, services: { 'OVER NIGHT': 2125, 'FLYER': 2280, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 3080 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 9, services: { 'OVER NIGHT': 2385, 'FLYER': 2560, 'ECONOMY': null, 'BLUE BOX': 1570, 'ON TIME SERVICE': 3250 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 10, services: { 'OVER NIGHT': 2645, 'FLYER': 2840, 'ECONOMY': null, 'BLUE BOX': 1670, 'ON TIME SERVICE': 3350 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 11, services: { 'OVER NIGHT': 2905, 'FLYER': 3120, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3490 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 12, services: { 'OVER NIGHT': 3165, 'FLYER': 3400, 'ECONOMY': null, 'BLUE BOX': 1880, 'ON TIME SERVICE': 3650 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 13, services: { 'OVER NIGHT': 3425, 'FLYER': 3680, 'ECONOMY': null, 'BLUE BOX': 2060, 'ON TIME SERVICE': 3750 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 14, services: { 'OVER NIGHT': 3685, 'FLYER': 3960, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 3850 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 15, services: { 'OVER NIGHT': 3945, 'FLYER': 4240, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 3950 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 16, services: { 'OVER NIGHT': 4205, 'FLYER': 4520, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 4050 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 17, services: { 'OVER NIGHT': 4465, 'FLYER': 4800, 'ECONOMY': null, 'BLUE BOX': 2450, 'ON TIME SERVICE': 4150 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 18, services: { 'OVER NIGHT': 4725, 'FLYER': 5080, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 4250 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 19, services: { 'OVER NIGHT': 4985, 'FLYER': 5360, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 4350 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 20, services: { 'OVER NIGHT': 5245, 'FLYER': 5640, 'ECONOMY': null, 'BLUE BOX': 2750, 'ON TIME SERVICE': 4450 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 21, services: { 'OVER NIGHT': 5505, 'FLYER': 5920, 'ECONOMY': null, 'BLUE BOX': 2850, 'ON TIME SERVICE': 4550 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 22, services: { 'OVER NIGHT': 5765, 'FLYER': 6200, 'ECONOMY': null, 'BLUE BOX': 2950, 'ON TIME SERVICE': 4650 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 23, services: { 'OVER NIGHT': 6025, 'FLYER': 6480, 'ECONOMY': null, 'BLUE BOX': 3050, 'ON TIME SERVICE': 4750 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 24, services: { 'OVER NIGHT': 6285, 'FLYER': 6760, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 4850 } },
  { route: 'SIALKOT_TO_SIALKOT', weight: 25, services: { 'OVER NIGHT': 6545, 'FLYER': 7040, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 4950 } },
];

// Sialkot to Narowal pricing data
const sialkotToNarowal: PricingData[] = [
  { route: 'SIALKOT_TO_NAROWAL', weight: 0.5, services: { 'OVER NIGHT': 315, 'FLYER': 360, 'ECONOMY': null, 'BLUE BOX': 450, 'ON TIME SERVICE': 560 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 1, services: { 'OVER NIGHT': 445, 'FLYER': 430, 'ECONOMY': null, 'BLUE BOX': 550, 'ON TIME SERVICE': 640 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 2, services: { 'OVER NIGHT': 865, 'FLYER': 810, 'ECONOMY': null, 'BLUE BOX': 700, 'ON TIME SERVICE': 1230 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 3, services: { 'OVER NIGHT': 1285, 'FLYER': 1190, 'ECONOMY': null, 'BLUE BOX': 910, 'ON TIME SERVICE': 1510 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 4, services: { 'OVER NIGHT': 1705, 'FLYER': 1570, 'ECONOMY': null, 'BLUE BOX': 1210, 'ON TIME SERVICE': 1980 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 1950, 'ECONOMY': null, 'BLUE BOX': 1400, 'ON TIME SERVICE': 2160 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 6, services: { 'OVER NIGHT': 2545, 'FLYER': 2330, 'ECONOMY': null, 'BLUE BOX': 1670, 'ON TIME SERVICE': 2550 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 7, services: { 'OVER NIGHT': 2965, 'FLYER': 2710, 'ECONOMY': null, 'BLUE BOX': 1950, 'ON TIME SERVICE': 2940 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 8, services: { 'OVER NIGHT': 3385, 'FLYER': 3090, 'ECONOMY': null, 'BLUE BOX': 2050, 'ON TIME SERVICE': 3230 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 9, services: { 'OVER NIGHT': 3805, 'FLYER': 3470, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 3400 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 10, services: { 'OVER NIGHT': 4225, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 3500 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 11, services: { 'OVER NIGHT': 4645, 'FLYER': 4230, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 3640 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 12, services: { 'OVER NIGHT': 5065, 'FLYER': 4610, 'ECONOMY': null, 'BLUE BOX': 2450, 'ON TIME SERVICE': 3800 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 13, services: { 'OVER NIGHT': 5485, 'FLYER': 4990, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 3900 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 14, services: { 'OVER NIGHT': 5905, 'FLYER': 5370, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 4000 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 15, services: { 'OVER NIGHT': 6325, 'FLYER': 5750, 'ECONOMY': null, 'BLUE BOX': 2940, 'ON TIME SERVICE': 4100 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 16, services: { 'OVER NIGHT': 6745, 'FLYER': 6130, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 4200 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 17, services: { 'OVER NIGHT': 7165, 'FLYER': 6510, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 4300 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 18, services: { 'OVER NIGHT': 7585, 'FLYER': 6890, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 4400 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 19, services: { 'OVER NIGHT': 8005, 'FLYER': 7270, 'ECONOMY': null, 'BLUE BOX': 3450, 'ON TIME SERVICE': 4500 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 20, services: { 'OVER NIGHT': 8425, 'FLYER': 7650, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 4600 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 21, services: { 'OVER NIGHT': 8845, 'FLYER': 8030, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 4700 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 22, services: { 'OVER NIGHT': 9265, 'FLYER': 8410, 'ECONOMY': null, 'BLUE BOX': 3850, 'ON TIME SERVICE': 4800 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 23, services: { 'OVER NIGHT': 9685, 'FLYER': 8790, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 4900 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 24, services: { 'OVER NIGHT': 10120, 'FLYER': 9170, 'ECONOMY': null, 'BLUE BOX': 4050, 'ON TIME SERVICE': 5000 } },
  { route: 'SIALKOT_TO_NAROWAL', weight: 25, services: { 'OVER NIGHT': 10525, 'FLYER': 9550, 'ECONOMY': null, 'BLUE BOX': 4150, 'ON TIME SERVICE': 5100 } },
];

// Sialkot to Gujranwala pricing data
const sialkotToGujranwala: PricingData[] = [
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 0.5, services: { 'OVER NIGHT': 315, 'FLYER': 360, 'ECONOMY': null, 'BLUE BOX': 450, 'ON TIME SERVICE': 500 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 1, services: { 'OVER NIGHT': 445, 'FLYER': 430, 'ECONOMY': null, 'BLUE BOX': 550, 'ON TIME SERVICE': 600 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 2, services: { 'OVER NIGHT': 865, 'FLYER': 810, 'ECONOMY': null, 'BLUE BOX': 670, 'ON TIME SERVICE': 1150 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 3, services: { 'OVER NIGHT': 1285, 'FLYER': 1190, 'ECONOMY': null, 'BLUE BOX': 910, 'ON TIME SERVICE': 1700 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 4, services: { 'OVER NIGHT': 1705, 'FLYER': 1570, 'ECONOMY': null, 'BLUE BOX': 1210, 'ON TIME SERVICE': 2150 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 1950, 'ECONOMY': null, 'BLUE BOX': 1400, 'ON TIME SERVICE': 2750 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 6, services: { 'OVER NIGHT': 2545, 'FLYER': 2330, 'ECONOMY': null, 'BLUE BOX': 1670, 'ON TIME SERVICE': 3050 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 7, services: { 'OVER NIGHT': 2965, 'FLYER': 2710, 'ECONOMY': null, 'BLUE BOX': 1950, 'ON TIME SERVICE': 3350 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 8, services: { 'OVER NIGHT': 3385, 'FLYER': 3090, 'ECONOMY': null, 'BLUE BOX': 2050, 'ON TIME SERVICE': 3650 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 9, services: { 'OVER NIGHT': 3805, 'FLYER': 3470, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 3950 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 10, services: { 'OVER NIGHT': 4225, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 4250 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 11, services: { 'OVER NIGHT': 4645, 'FLYER': 4230, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 4550 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 12, services: { 'OVER NIGHT': 5065, 'FLYER': 4610, 'ECONOMY': null, 'BLUE BOX': 2450, 'ON TIME SERVICE': 4850 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 13, services: { 'OVER NIGHT': 5485, 'FLYER': 4990, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 5150 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 14, services: { 'OVER NIGHT': 5905, 'FLYER': 5370, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 5550 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 15, services: { 'OVER NIGHT': 6325, 'FLYER': 5750, 'ECONOMY': null, 'BLUE BOX': 2950, 'ON TIME SERVICE': 5850 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 16, services: { 'OVER NIGHT': 6745, 'FLYER': 6130, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 6150 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 17, services: { 'OVER NIGHT': 7165, 'FLYER': 6510, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 6450 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 18, services: { 'OVER NIGHT': 7585, 'FLYER': 6890, 'ECONOMY': null, 'BLUE BOX': 3450, 'ON TIME SERVICE': 6750 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 19, services: { 'OVER NIGHT': 8005, 'FLYER': 7270, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 7050 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 20, services: { 'OVER NIGHT': 8425, 'FLYER': 7650, 'ECONOMY': null, 'BLUE BOX': 3650, 'ON TIME SERVICE': 7500 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 21, services: { 'OVER NIGHT': 8845, 'FLYER': 8030, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 7800 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 22, services: { 'OVER NIGHT': 9265, 'FLYER': 8410, 'ECONOMY': null, 'BLUE BOX': 3850, 'ON TIME SERVICE': 8100 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 23, services: { 'OVER NIGHT': 9685, 'FLYER': 8790, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 8400 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 24, services: { 'OVER NIGHT': 10105, 'FLYER': 9170, 'ECONOMY': null, 'BLUE BOX': 4050, 'ON TIME SERVICE': 8700 } },
  { route: 'SIALKOT_TO_GUJRANWALA', weight: 25, services: { 'OVER NIGHT': 10525, 'FLYER': 9550, 'ECONOMY': null, 'BLUE BOX': 4150, 'ON TIME SERVICE': 9400 } },
];

// Sialkot to Lahore pricing data
const sialkotToLahore: PricingData[] = [
  { route: 'SIALKOT_TO_LAHORE', weight: 0.5, services: { 'OVER NIGHT': 315, 'FLYER': 390, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 500 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 1, services: { 'OVER NIGHT': 445, 'FLYER': 490, 'ECONOMY': null, 'BLUE BOX': 450, 'ON TIME SERVICE': 600 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 2, services: { 'OVER NIGHT': 865, 'FLYER': 910, 'ECONOMY': null, 'BLUE BOX': 670, 'ON TIME SERVICE': 1150 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 3, services: { 'OVER NIGHT': 1285, 'FLYER': 1310, 'ECONOMY': null, 'BLUE BOX': 1140, 'ON TIME SERVICE': 1690 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 4, services: { 'OVER NIGHT': 1705, 'FLYER': 1750, 'ECONOMY': null, 'BLUE BOX': 1310, 'ON TIME SERVICE': 2230 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2170, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 2770 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 6, services: { 'OVER NIGHT': 2545, 'FLYER': 2590, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3300 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 7, services: { 'OVER NIGHT': 2965, 'FLYER': 3010, 'ECONOMY': null, 'BLUE BOX': 2040, 'ON TIME SERVICE': 3850 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 8, services: { 'OVER NIGHT': 3385, 'FLYER': 3430, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 4390 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 9, services: { 'OVER NIGHT': 3805, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 4930 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 10, services: { 'OVER NIGHT': 4225, 'FLYER': 4270, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 5470 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 11, services: { 'OVER NIGHT': 4645, 'FLYER': 4690, 'ECONOMY': null, 'BLUE BOX': 2570, 'ON TIME SERVICE': 6010 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 12, services: { 'OVER NIGHT': 5065, 'FLYER': 5110, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 6550 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 13, services: { 'OVER NIGHT': 5485, 'FLYER': 5530, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 6950 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 14, services: { 'OVER NIGHT': 5905, 'FLYER': 5950, 'ECONOMY': null, 'BLUE BOX': 3000, 'ON TIME SERVICE': 7550 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 15, services: { 'OVER NIGHT': 6325, 'FLYER': 6370, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 8150 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 16, services: { 'OVER NIGHT': 6745, 'FLYER': 6790, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 8650 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 17, services: { 'OVER NIGHT': 7165, 'FLYER': 7210, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 9100 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 18, services: { 'OVER NIGHT': 7585, 'FLYER': 7630, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 9650 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 19, services: { 'OVER NIGHT': 8005, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 10500 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 20, services: { 'OVER NIGHT': 8425, 'FLYER': 8470, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 11000 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 21, services: { 'OVER NIGHT': 8845, 'FLYER': 8890, 'ECONOMY': null, 'BLUE BOX': 4250, 'ON TIME SERVICE': 11500 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 22, services: { 'OVER NIGHT': 9265, 'FLYER': 9310, 'ECONOMY': null, 'BLUE BOX': 4350, 'ON TIME SERVICE': 12000 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 23, services: { 'OVER NIGHT': 9685, 'FLYER': 9730, 'ECONOMY': null, 'BLUE BOX': 4450, 'ON TIME SERVICE': 12500 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 24, services: { 'OVER NIGHT': 10105, 'FLYER': 10150, 'ECONOMY': null, 'BLUE BOX': 4550, 'ON TIME SERVICE': 13500 } },
  { route: 'SIALKOT_TO_LAHORE', weight: 25, services: { 'OVER NIGHT': 10525, 'FLYER': 10570, 'ECONOMY': null, 'BLUE BOX': 4600, 'ON TIME SERVICE': 14000 } },
];

// Sialkot to Islamabad pricing data
const sialkotToIslamabad: PricingData[] = [
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 0.5, services: { 'OVER NIGHT': 395, 'FLYER': 460, 'ECONOMY': null, 'BLUE BOX': 400, 'ON TIME SERVICE': 570 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 1, services: { 'OVER NIGHT': 535, 'FLYER': 540, 'ECONOMY': null, 'BLUE BOX': 500, 'ON TIME SERVICE': 660 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 2, services: { 'OVER NIGHT': 895, 'FLYER': 1000, 'ECONOMY': null, 'BLUE BOX': 650, 'ON TIME SERVICE': 1240 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 3, services: { 'OVER NIGHT': 1255, 'FLYER': 1460, 'ECONOMY': null, 'BLUE BOX': 1050, 'ON TIME SERVICE': 1820 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 4, services: { 'OVER NIGHT': 1615, 'FLYER': 1920, 'ECONOMY': null, 'BLUE BOX': 1390, 'ON TIME SERVICE': 2400 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 5, services: { 'OVER NIGHT': 1975, 'FLYER': 2380, 'ECONOMY': null, 'BLUE BOX': 1550, 'ON TIME SERVICE': 2980 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 6, services: { 'OVER NIGHT': 2335, 'FLYER': 2840, 'ECONOMY': null, 'BLUE BOX': 1850, 'ON TIME SERVICE': 3560 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 7, services: { 'OVER NIGHT': 2695, 'FLYER': 3300, 'ECONOMY': null, 'BLUE BOX': 1950, 'ON TIME SERVICE': 4140 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 8, services: { 'OVER NIGHT': 3055, 'FLYER': 3700, 'ECONOMY': null, 'BLUE BOX': 2050, 'ON TIME SERVICE': 4720 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 9, services: { 'OVER NIGHT': 3415, 'FLYER': 4200, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 5300 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 10, services: { 'OVER NIGHT': 3775, 'FLYER': 4600, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 5850 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 11, services: { 'OVER NIGHT': 4135, 'FLYER': 5100, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 6460 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 12, services: { 'OVER NIGHT': 4495, 'FLYER': 5600, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 7040 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 13, services: { 'OVER NIGHT': 4855, 'FLYER': 6000, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 7620 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 14, services: { 'OVER NIGHT': 5215, 'FLYER': 6500, 'ECONOMY': null, 'BLUE BOX': 2750, 'ON TIME SERVICE': 8200 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 15, services: { 'OVER NIGHT': 5575, 'FLYER': 6900, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 8750 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 16, services: { 'OVER NIGHT': 5935, 'FLYER': 7400, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 9350 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 17, services: { 'OVER NIGHT': 6295, 'FLYER': 7900, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 9950 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 18, services: { 'OVER NIGHT': 6655, 'FLYER': 8300, 'ECONOMY': null, 'BLUE BOX': 3450, 'ON TIME SERVICE': 10500 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 19, services: { 'OVER NIGHT': 7015, 'FLYER': 8800, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 11200 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 20, services: { 'OVER NIGHT': 7375, 'FLYER': 9200, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 11700 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 21, services: { 'OVER NIGHT': 7735, 'FLYER': 9700, 'ECONOMY': null, 'BLUE BOX': 3850, 'ON TIME SERVICE': 12300 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 22, services: { 'OVER NIGHT': 8095, 'FLYER': 10200, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 12900 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 23, services: { 'OVER NIGHT': 8455, 'FLYER': 10600, 'ECONOMY': null, 'BLUE BOX': 4050, 'ON TIME SERVICE': 13500 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 24, services: { 'OVER NIGHT': 8815, 'FLYER': 11100, 'ECONOMY': null, 'BLUE BOX': 4150, 'ON TIME SERVICE': 14000 } },
  { route: 'SIALKOT_TO_ISLAMABAD', weight: 25, services: { 'OVER NIGHT': 9175, 'FLYER': 11600, 'ECONOMY': null, 'BLUE BOX': 4250, 'ON TIME SERVICE': 14500 } },
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
        serviceType: 'GENERAL',
        status: 'active',
      },
    });
    console.log(`Created service: ${serviceName} (${serviceCode})`);
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
    SLT: 'Sialkot',
    NRL: 'Narowal',
    GUJ: 'Gujranwala',
    LHE: 'Lahore',
    ISB: 'Islamabad',
  };
  return cityNames[cityCode] || cityCode;
}

async function main() {
  console.log('Starting Sialkot rates seeding...');

  try {
    // Seed all routes
    await createPricingRules(CITY_CODES.SIALKOT, CITY_CODES.SIALKOT, sialkotToSialkot);
    await createPricingRules(CITY_CODES.SIALKOT, CITY_CODES.NAROWAL, sialkotToNarowal);
    await createPricingRules(CITY_CODES.SIALKOT, CITY_CODES.GUJRANWALA, sialkotToGujranwala);
    await createPricingRules(CITY_CODES.SIALKOT, CITY_CODES.LAHORE, sialkotToLahore);
    await createPricingRules(CITY_CODES.SIALKOT, CITY_CODES.ISLAMABAD, sialkotToIslamabad);

    console.log('✅ Sialkot rates seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Sialkot rates:', error);
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
