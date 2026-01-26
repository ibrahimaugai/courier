import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// City codes mapping
const CITY_CODES = {
  LAHORE: 'LHE',
  NAROWAL: 'NRL',
  GUJRANWALA: 'GUJ',
  SIALKOT: 'SLT',
  ISLAMABAD: 'ISB',
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

// Lahore to Lahore pricing data
const lahoreToLahore: PricingData[] = [
  { route: 'LAHORE_TO_LAHORE', weight: 0.5, services: { 'OVER NIGHT': 245, 'FLYER': 285, 'ECONOMY': null, 'BLUE BOX': 300, 'ON TIME SERVICE': 410 } },
  { route: 'LAHORE_TO_LAHORE', weight: 1, services: { 'OVER NIGHT': 305, 'FLYER': 320, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 490 } },
  { route: 'LAHORE_TO_LAHORE', weight: 2, services: { 'OVER NIGHT': 565, 'FLYER': 600, 'ECONOMY': null, 'BLUE BOX': 520, 'ON TIME SERVICE': 1080 } },
  { route: 'LAHORE_TO_LAHORE', weight: 3, services: { 'OVER NIGHT': 825, 'FLYER': 880, 'ECONOMY': null, 'BLUE BOX': 780, 'ON TIME SERVICE': 1360 } },
  { route: 'LAHORE_TO_LAHORE', weight: 4, services: { 'OVER NIGHT': 1085, 'FLYER': 1160, 'ECONOMY': null, 'BLUE BOX': 870, 'ON TIME SERVICE': 1830 } },
  { route: 'LAHORE_TO_LAHORE', weight: 5, services: { 'OVER NIGHT': 1345, 'FLYER': 1440, 'ECONOMY': null, 'BLUE BOX': 970, 'ON TIME SERVICE': 2010 } },
  { route: 'LAHORE_TO_LAHORE', weight: 6, services: { 'OVER NIGHT': 1605, 'FLYER': 1720, 'ECONOMY': null, 'BLUE BOX': 1170, 'ON TIME SERVICE': 2400 } },
  { route: 'LAHORE_TO_LAHORE', weight: 7, services: { 'OVER NIGHT': 1865, 'FLYER': 2000, 'ECONOMY': null, 'BLUE BOX': 1360, 'ON TIME SERVICE': 2790 } },
  { route: 'LAHORE_TO_LAHORE', weight: 8, services: { 'OVER NIGHT': 2125, 'FLYER': 2280, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 3080 } },
  { route: 'LAHORE_TO_LAHORE', weight: 9, services: { 'OVER NIGHT': 2385, 'FLYER': 2560, 'ECONOMY': null, 'BLUE BOX': 1570, 'ON TIME SERVICE': 3250 } },
  { route: 'LAHORE_TO_LAHORE', weight: 10, services: { 'OVER NIGHT': 2645, 'FLYER': 2840, 'ECONOMY': null, 'BLUE BOX': 1670, 'ON TIME SERVICE': 3350 } },
  { route: 'LAHORE_TO_LAHORE', weight: 11, services: { 'OVER NIGHT': 2905, 'FLYER': 3120, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3490 } },
  { route: 'LAHORE_TO_LAHORE', weight: 12, services: { 'OVER NIGHT': 3165, 'FLYER': 3400, 'ECONOMY': null, 'BLUE BOX': 1880, 'ON TIME SERVICE': 3650 } },
  { route: 'LAHORE_TO_LAHORE', weight: 13, services: { 'OVER NIGHT': 3425, 'FLYER': 3680, 'ECONOMY': null, 'BLUE BOX': 2060, 'ON TIME SERVICE': 3750 } },
  { route: 'LAHORE_TO_LAHORE', weight: 14, services: { 'OVER NIGHT': 3685, 'FLYER': 3960, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 3850 } },
  { route: 'LAHORE_TO_LAHORE', weight: 15, services: { 'OVER NIGHT': 3945, 'FLYER': 4240, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 3950 } },
  { route: 'LAHORE_TO_LAHORE', weight: 16, services: { 'OVER NIGHT': 4205, 'FLYER': 4520, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 4050 } },
  { route: 'LAHORE_TO_LAHORE', weight: 17, services: { 'OVER NIGHT': 4465, 'FLYER': 4800, 'ECONOMY': null, 'BLUE BOX': 2450, 'ON TIME SERVICE': 4150 } },
  { route: 'LAHORE_TO_LAHORE', weight: 18, services: { 'OVER NIGHT': 4725, 'FLYER': 5080, 'ECONOMY': null, 'BLUE BOX': 2550, 'ON TIME SERVICE': 4250 } },
  { route: 'LAHORE_TO_LAHORE', weight: 19, services: { 'OVER NIGHT': 4985, 'FLYER': 5360, 'ECONOMY': null, 'BLUE BOX': 2650, 'ON TIME SERVICE': 4350 } },
  { route: 'LAHORE_TO_LAHORE', weight: 20, services: { 'OVER NIGHT': 5245, 'FLYER': 5640, 'ECONOMY': null, 'BLUE BOX': 2750, 'ON TIME SERVICE': 4450 } },
  { route: 'LAHORE_TO_LAHORE', weight: 21, services: { 'OVER NIGHT': 5505, 'FLYER': 5920, 'ECONOMY': null, 'BLUE BOX': 2850, 'ON TIME SERVICE': 4550 } },
  { route: 'LAHORE_TO_LAHORE', weight: 22, services: { 'OVER NIGHT': 5765, 'FLYER': 6200, 'ECONOMY': null, 'BLUE BOX': 2950, 'ON TIME SERVICE': 4650 } },
  { route: 'LAHORE_TO_LAHORE', weight: 23, services: { 'OVER NIGHT': 6025, 'FLYER': 6480, 'ECONOMY': null, 'BLUE BOX': 3050, 'ON TIME SERVICE': 4750 } },
  { route: 'LAHORE_TO_LAHORE', weight: 24, services: { 'OVER NIGHT': 6285, 'FLYER': 6760, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 4850 } },
  { route: 'LAHORE_TO_LAHORE', weight: 25, services: { 'OVER NIGHT': 6545, 'FLYER': 7040, 'ECONOMY': null, 'BLUE BOX': 3250, 'ON TIME SERVICE': 4950 } },
];

// Lahore to Narowal pricing data
const lahoreToNarowal: PricingData[] = [
  { route: 'LAHORE_TO_NAROWAL', weight: 0.5, services: { 'OVER NIGHT': 315, 'FLYER': 390, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 500 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 1, services: { 'OVER NIGHT': 445, 'FLYER': 490, 'ECONOMY': null, 'BLUE BOX': 450, 'ON TIME SERVICE': 600 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 2, services: { 'OVER NIGHT': 865, 'FLYER': 910, 'ECONOMY': null, 'BLUE BOX': 670, 'ON TIME SERVICE': 1150 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 3, services: { 'OVER NIGHT': 1285, 'FLYER': 1310, 'ECONOMY': null, 'BLUE BOX': 1140, 'ON TIME SERVICE': 1690 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 4, services: { 'OVER NIGHT': 1705, 'FLYER': 1750, 'ECONOMY': null, 'BLUE BOX': 1310, 'ON TIME SERVICE': 2230 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2170, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 2770 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 6, services: { 'OVER NIGHT': 2545, 'FLYER': 2590, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3300 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 7, services: { 'OVER NIGHT': 2965, 'FLYER': 3010, 'ECONOMY': null, 'BLUE BOX': 2040, 'ON TIME SERVICE': 3850 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 8, services: { 'OVER NIGHT': 3385, 'FLYER': 3430, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 4390 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 9, services: { 'OVER NIGHT': 3805, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 4930 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 10, services: { 'OVER NIGHT': 4225, 'FLYER': 4270, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 5470 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 11, services: { 'OVER NIGHT': 4645, 'FLYER': 4690, 'ECONOMY': null, 'BLUE BOX': 2570, 'ON TIME SERVICE': 6010 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 12, services: { 'OVER NIGHT': 5065, 'FLYER': 5110, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 6550 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 13, services: { 'OVER NIGHT': 5485, 'FLYER': 5530, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 6950 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 14, services: { 'OVER NIGHT': 5905, 'FLYER': 5950, 'ECONOMY': null, 'BLUE BOX': 3000, 'ON TIME SERVICE': 7550 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 15, services: { 'OVER NIGHT': 6325, 'FLYER': 6370, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 8150 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 16, services: { 'OVER NIGHT': 6745, 'FLYER': 6790, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 8650 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 17, services: { 'OVER NIGHT': 7165, 'FLYER': 7210, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 9100 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 18, services: { 'OVER NIGHT': 7585, 'FLYER': 7630, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 9650 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 19, services: { 'OVER NIGHT': 8005, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 10500 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 20, services: { 'OVER NIGHT': 8425, 'FLYER': 8470, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 11000 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 21, services: { 'OVER NIGHT': 8845, 'FLYER': 8890, 'ECONOMY': null, 'BLUE BOX': 4250, 'ON TIME SERVICE': 11500 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 22, services: { 'OVER NIGHT': 9265, 'FLYER': 9310, 'ECONOMY': null, 'BLUE BOX': 4350, 'ON TIME SERVICE': 12000 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 23, services: { 'OVER NIGHT': 9685, 'FLYER': 9730, 'ECONOMY': null, 'BLUE BOX': 4450, 'ON TIME SERVICE': 12500 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 24, services: { 'OVER NIGHT': 10105, 'FLYER': 10150, 'ECONOMY': null, 'BLUE BOX': 4550, 'ON TIME SERVICE': 13500 } },
  { route: 'LAHORE_TO_NAROWAL', weight: 25, services: { 'OVER NIGHT': 10525, 'FLYER': 10570, 'ECONOMY': null, 'BLUE BOX': 4600, 'ON TIME SERVICE': 14000 } },
];

// Lahore to Gujranwala pricing data
const lahoreToGujranwala: PricingData[] = [
  { route: 'LAHORE_TO_GUJRANWALA', weight: 0.5, services: { 'OVER NIGHT': 365, 'FLYER': 410, 'ECONOMY': null, 'BLUE BOX': 500, 'ON TIME SERVICE': 550 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 1, services: { 'OVER NIGHT': 495, 'FLYER': 480, 'ECONOMY': null, 'BLUE BOX': 600, 'ON TIME SERVICE': 650 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 2, services: { 'OVER NIGHT': 915, 'FLYER': 860, 'ECONOMY': null, 'BLUE BOX': 720, 'ON TIME SERVICE': 1200 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 3, services: { 'OVER NIGHT': 1335, 'FLYER': 1240, 'ECONOMY': null, 'BLUE BOX': 960, 'ON TIME SERVICE': 1750 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 4, services: { 'OVER NIGHT': 1755, 'FLYER': 1620, 'ECONOMY': null, 'BLUE BOX': 1260, 'ON TIME SERVICE': 2200 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 5, services: { 'OVER NIGHT': 2175, 'FLYER': 2000, 'ECONOMY': null, 'BLUE BOX': 1450, 'ON TIME SERVICE': 2800 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 6, services: { 'OVER NIGHT': 2595, 'FLYER': 2380, 'ECONOMY': null, 'BLUE BOX': 1720, 'ON TIME SERVICE': 3100 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 7, services: { 'OVER NIGHT': 3015, 'FLYER': 2760, 'ECONOMY': null, 'BLUE BOX': 2000, 'ON TIME SERVICE': 3400 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 8, services: { 'OVER NIGHT': 3435, 'FLYER': 3140, 'ECONOMY': null, 'BLUE BOX': 2100, 'ON TIME SERVICE': 3700 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 9, services: { 'OVER NIGHT': 3855, 'FLYER': 3520, 'ECONOMY': null, 'BLUE BOX': 2200, 'ON TIME SERVICE': 4000 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 10, services: { 'OVER NIGHT': 4275, 'FLYER': 3900, 'ECONOMY': null, 'BLUE BOX': 2300, 'ON TIME SERVICE': 4300 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 11, services: { 'OVER NIGHT': 4695, 'FLYER': 4280, 'ECONOMY': null, 'BLUE BOX': 2400, 'ON TIME SERVICE': 4600 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 12, services: { 'OVER NIGHT': 5115, 'FLYER': 4660, 'ECONOMY': null, 'BLUE BOX': 2500, 'ON TIME SERVICE': 4900 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 13, services: { 'OVER NIGHT': 5535, 'FLYER': 5040, 'ECONOMY': null, 'BLUE BOX': 2600, 'ON TIME SERVICE': 5200 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 14, services: { 'OVER NIGHT': 5955, 'FLYER': 5420, 'ECONOMY': null, 'BLUE BOX': 2700, 'ON TIME SERVICE': 5600 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 15, services: { 'OVER NIGHT': 6375, 'FLYER': 5800, 'ECONOMY': null, 'BLUE BOX': 3000, 'ON TIME SERVICE': 5900 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 16, services: { 'OVER NIGHT': 6795, 'FLYER': 6180, 'ECONOMY': null, 'BLUE BOX': 3200, 'ON TIME SERVICE': 6200 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 17, services: { 'OVER NIGHT': 7215, 'FLYER': 6560, 'ECONOMY': null, 'BLUE BOX': 3400, 'ON TIME SERVICE': 6500 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 18, services: { 'OVER NIGHT': 7635, 'FLYER': 6940, 'ECONOMY': null, 'BLUE BOX': 3500, 'ON TIME SERVICE': 6800 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 19, services: { 'OVER NIGHT': 8055, 'FLYER': 7320, 'ECONOMY': null, 'BLUE BOX': 3600, 'ON TIME SERVICE': 7100 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 20, services: { 'OVER NIGHT': 8475, 'FLYER': 7700, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 7550 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 21, services: { 'OVER NIGHT': 8895, 'FLYER': 8080, 'ECONOMY': null, 'BLUE BOX': 3800, 'ON TIME SERVICE': 7850 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 22, services: { 'OVER NIGHT': 9315, 'FLYER': 8460, 'ECONOMY': null, 'BLUE BOX': 3900, 'ON TIME SERVICE': 8150 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 23, services: { 'OVER NIGHT': 9735, 'FLYER': 8840, 'ECONOMY': null, 'BLUE BOX': 4000, 'ON TIME SERVICE': 8450 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 24, services: { 'OVER NIGHT': 10155, 'FLYER': 9220, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 8750 } },
  { route: 'LAHORE_TO_GUJRANWALA', weight: 25, services: { 'OVER NIGHT': 10575, 'FLYER': 9600, 'ECONOMY': null, 'BLUE BOX': 4200, 'ON TIME SERVICE': 9450 } },
];

// Lahore to Sialkot pricing data
const lahoreToSialkot: PricingData[] = [
  { route: 'LAHORE_TO_SIALKOT', weight: 0.5, services: { 'OVER NIGHT': 315, 'FLYER': 390, 'ECONOMY': null, 'BLUE BOX': 350, 'ON TIME SERVICE': 500 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 1, services: { 'OVER NIGHT': 445, 'FLYER': 490, 'ECONOMY': null, 'BLUE BOX': 450, 'ON TIME SERVICE': 600 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 2, services: { 'OVER NIGHT': 865, 'FLYER': 910, 'ECONOMY': null, 'BLUE BOX': 670, 'ON TIME SERVICE': 1150 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 3, services: { 'OVER NIGHT': 1285, 'FLYER': 1310, 'ECONOMY': null, 'BLUE BOX': 1140, 'ON TIME SERVICE': 1690 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 4, services: { 'OVER NIGHT': 1705, 'FLYER': 1750, 'ECONOMY': null, 'BLUE BOX': 1310, 'ON TIME SERVICE': 2230 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2170, 'ECONOMY': null, 'BLUE BOX': 1470, 'ON TIME SERVICE': 2770 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 6, services: { 'OVER NIGHT': 2545, 'FLYER': 2590, 'ECONOMY': null, 'BLUE BOX': 1750, 'ON TIME SERVICE': 3300 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 7, services: { 'OVER NIGHT': 2965, 'FLYER': 3010, 'ECONOMY': null, 'BLUE BOX': 2040, 'ON TIME SERVICE': 3850 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 8, services: { 'OVER NIGHT': 3385, 'FLYER': 3430, 'ECONOMY': null, 'BLUE BOX': 2150, 'ON TIME SERVICE': 4390 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 9, services: { 'OVER NIGHT': 3805, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2250, 'ON TIME SERVICE': 4930 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 10, services: { 'OVER NIGHT': 4225, 'FLYER': 4270, 'ECONOMY': null, 'BLUE BOX': 2350, 'ON TIME SERVICE': 5470 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 11, services: { 'OVER NIGHT': 4645, 'FLYER': 4690, 'ECONOMY': null, 'BLUE BOX': 2570, 'ON TIME SERVICE': 6010 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 12, services: { 'OVER NIGHT': 5065, 'FLYER': 5110, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 6550 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 13, services: { 'OVER NIGHT': 5485, 'FLYER': 5530, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 6950 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 14, services: { 'OVER NIGHT': 5905, 'FLYER': 5950, 'ECONOMY': null, 'BLUE BOX': 3000, 'ON TIME SERVICE': 7550 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 15, services: { 'OVER NIGHT': 6325, 'FLYER': 6370, 'ECONOMY': null, 'BLUE BOX': 3150, 'ON TIME SERVICE': 8150 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 16, services: { 'OVER NIGHT': 6745, 'FLYER': 6790, 'ECONOMY': null, 'BLUE BOX': 3350, 'ON TIME SERVICE': 8650 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 17, services: { 'OVER NIGHT': 7165, 'FLYER': 7210, 'ECONOMY': null, 'BLUE BOX': 3550, 'ON TIME SERVICE': 9100 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 18, services: { 'OVER NIGHT': 7585, 'FLYER': 7630, 'ECONOMY': null, 'BLUE BOX': 3750, 'ON TIME SERVICE': 9650 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 19, services: { 'OVER NIGHT': 8005, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3950, 'ON TIME SERVICE': 10500 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 20, services: { 'OVER NIGHT': 8425, 'FLYER': 8470, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 11000 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 21, services: { 'OVER NIGHT': 8845, 'FLYER': 8890, 'ECONOMY': null, 'BLUE BOX': 4250, 'ON TIME SERVICE': 11500 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 22, services: { 'OVER NIGHT': 9265, 'FLYER': 9310, 'ECONOMY': null, 'BLUE BOX': 4350, 'ON TIME SERVICE': 12000 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 23, services: { 'OVER NIGHT': 9685, 'FLYER': 9730, 'ECONOMY': null, 'BLUE BOX': 4450, 'ON TIME SERVICE': 12500 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 24, services: { 'OVER NIGHT': 10105, 'FLYER': 10150, 'ECONOMY': null, 'BLUE BOX': 4550, 'ON TIME SERVICE': 13500 } },
  { route: 'LAHORE_TO_SIALKOT', weight: 25, services: { 'OVER NIGHT': 10525, 'FLYER': 10570, 'ECONOMY': null, 'BLUE BOX': 4600, 'ON TIME SERVICE': 14000 } },
];

// Lahore to Islamabad pricing data
const lahoreToIslamabad: PricingData[] = [
  { route: 'LAHORE_TO_ISLAMABAD', weight: 0.5, services: { 'OVER NIGHT': 545, 'FLYER': 610, 'ECONOMY': null, 'BLUE BOX': 550, 'ON TIME SERVICE': 720 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 1, services: { 'OVER NIGHT': 685, 'FLYER': 690, 'ECONOMY': null, 'BLUE BOX': 650, 'ON TIME SERVICE': 810 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 2, services: { 'OVER NIGHT': 1045, 'FLYER': 1150, 'ECONOMY': null, 'BLUE BOX': 800, 'ON TIME SERVICE': 1390 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 3, services: { 'OVER NIGHT': 1405, 'FLYER': 1610, 'ECONOMY': null, 'BLUE BOX': 1200, 'ON TIME SERVICE': 1970 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 4, services: { 'OVER NIGHT': 1765, 'FLYER': 2070, 'ECONOMY': null, 'BLUE BOX': 1540, 'ON TIME SERVICE': 2550 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 5, services: { 'OVER NIGHT': 2125, 'FLYER': 2530, 'ECONOMY': null, 'BLUE BOX': 1700, 'ON TIME SERVICE': 3130 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 6, services: { 'OVER NIGHT': 2485, 'FLYER': 2990, 'ECONOMY': null, 'BLUE BOX': 2000, 'ON TIME SERVICE': 3710 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 7, services: { 'OVER NIGHT': 2845, 'FLYER': 3450, 'ECONOMY': null, 'BLUE BOX': 2100, 'ON TIME SERVICE': 4290 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 8, services: { 'OVER NIGHT': 3205, 'FLYER': 3850, 'ECONOMY': null, 'BLUE BOX': 2200, 'ON TIME SERVICE': 4870 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 9, services: { 'OVER NIGHT': 3565, 'FLYER': 4350, 'ECONOMY': null, 'BLUE BOX': 2300, 'ON TIME SERVICE': 5450 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 10, services: { 'OVER NIGHT': 3925, 'FLYER': 4750, 'ECONOMY': null, 'BLUE BOX': 2400, 'ON TIME SERVICE': 6000 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 11, services: { 'OVER NIGHT': 4285, 'FLYER': 5250, 'ECONOMY': null, 'BLUE BOX': 2500, 'ON TIME SERVICE': 6610 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 12, services: { 'OVER NIGHT': 4645, 'FLYER': 5750, 'ECONOMY': null, 'BLUE BOX': 2700, 'ON TIME SERVICE': 7190 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 13, services: { 'OVER NIGHT': 5005, 'FLYER': 6150, 'ECONOMY': null, 'BLUE BOX': 2800, 'ON TIME SERVICE': 7770 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 14, services: { 'OVER NIGHT': 5365, 'FLYER': 6650, 'ECONOMY': null, 'BLUE BOX': 2900, 'ON TIME SERVICE': 8350 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 15, services: { 'OVER NIGHT': 5725, 'FLYER': 7050, 'ECONOMY': null, 'BLUE BOX': 3300, 'ON TIME SERVICE': 8900 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 16, services: { 'OVER NIGHT': 6085, 'FLYER': 7550, 'ECONOMY': null, 'BLUE BOX': 3400, 'ON TIME SERVICE': 9500 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 17, services: { 'OVER NIGHT': 6445, 'FLYER': 8050, 'ECONOMY': null, 'BLUE BOX': 3500, 'ON TIME SERVICE': 10100 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 18, services: { 'OVER NIGHT': 6805, 'FLYER': 8450, 'ECONOMY': null, 'BLUE BOX': 3600, 'ON TIME SERVICE': 10650 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 19, services: { 'OVER NIGHT': 7165, 'FLYER': 8950, 'ECONOMY': null, 'BLUE BOX': 3700, 'ON TIME SERVICE': 11350 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 20, services: { 'OVER NIGHT': 7525, 'FLYER': 9350, 'ECONOMY': null, 'BLUE BOX': 3900, 'ON TIME SERVICE': 11850 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 21, services: { 'OVER NIGHT': 7885, 'FLYER': 9850, 'ECONOMY': null, 'BLUE BOX': 4000, 'ON TIME SERVICE': 12450 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 22, services: { 'OVER NIGHT': 8245, 'FLYER': 10350, 'ECONOMY': null, 'BLUE BOX': 4100, 'ON TIME SERVICE': 13050 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 23, services: { 'OVER NIGHT': 8605, 'FLYER': 10750, 'ECONOMY': null, 'BLUE BOX': 4200, 'ON TIME SERVICE': 13650 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 24, services: { 'OVER NIGHT': 8965, 'FLYER': 11250, 'ECONOMY': null, 'BLUE BOX': 4300, 'ON TIME SERVICE': 14150 } },
  { route: 'LAHORE_TO_ISLAMABAD', weight: 25, services: { 'OVER NIGHT': 9325, 'FLYER': 11750, 'ECONOMY': null, 'BLUE BOX': 4400, 'ON TIME SERVICE': 14650 } },
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
    LHE: 'Lahore',
    NRL: 'Narowal',
    GUJ: 'Gujranwala',
    SLT: 'Sialkot',
    ISB: 'Islamabad',
    KCH: 'Karachi',
  };
  return cityNames[cityCode] || cityCode;
}

async function main() {
  console.log('Starting Lahore rates seeding...');

  try {
    // Seed all routes
    await createPricingRules(CITY_CODES.LAHORE, CITY_CODES.LAHORE, lahoreToLahore);
    await createPricingRules(CITY_CODES.LAHORE, CITY_CODES.NAROWAL, lahoreToNarowal);
    await createPricingRules(CITY_CODES.LAHORE, CITY_CODES.GUJRANWALA, lahoreToGujranwala);
    await createPricingRules(CITY_CODES.LAHORE, CITY_CODES.SIALKOT, lahoreToSialkot);
    await createPricingRules(CITY_CODES.LAHORE, CITY_CODES.ISLAMABAD, lahoreToIslamabad);

    console.log('✅ Lahore rates seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Lahore rates:', error);
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
