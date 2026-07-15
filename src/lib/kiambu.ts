// Kiambu County constituencies & wards for cascading selectors.
export const KIAMBU: Record<string, string[]> = {
  Githunguri: ["Githunguri", "Githiga", "Ikinu", "Ngemwa", "Komothai"],
  Kiambaa: ["Cianda", "Karuri", "Ndenderu", "Muchatha", "Kihara"],
  Kabete: ["Gitaru", "Muguga", "Nyadhuna", "Kabete", "Uthiru"],
  Limuru: ["Bibirioni", "Limuru Central", "Ndeiya", "Limuru East", "Ngecha Chura"],
  Lari: ["Kinale", "Kijabe", "Nyanduma", "Kamburu", "Lari Kadu"],
  "Gatundu South": ["Kiamwangi", "Kiganjo", "Ndundu", "Ngenda"],
  "Gatundu North": ["Gituamba", "Githobokoni", "Chania", "Mang'u"],
  Ruiru: [
    "Gitothua", "Biashara", "Gatongora", "Kahawa Sukari",
    "Kahawa Wendani", "Kiuu", "Mwiki", "Mwihoko",
  ],
  "Thika Town": ["Township", "Kamenu", "Hospital", "Gatuanyaga", "Ngoliba"],
  Juja: ["Murera", "Theta", "Juja", "Witeithie", "Kalimoni"],
  Kiambu: ["Ting'ang'a", "Ndumberi", "Riabai", "Township"],
  Kikuyu: ["Karai", "Nachu", "Sigona", "Kikuyu", "Kinoo"],
};

export const CONSTITUENCIES = Object.keys(KIAMBU);

// Kenyan phone: 07XXXXXXXX / 01XXXXXXXX / +2547XXXXXXXX / +2541XXXXXXXX
export const KE_PHONE_REGEX = /^(?:\+254|0)(?:7|1)\d{8}$/;

export function normalizeKePhone(input: string): string {
  const trimmed = input.replace(/\s+/g, "");
  if (trimmed.startsWith("+254")) return trimmed;
  if (trimmed.startsWith("0")) return "+254" + trimmed.slice(1);
  return trimmed;
}
