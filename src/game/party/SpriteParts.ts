export interface HeroSpriteParts {
  headColor: number;
  torsoColor: number;
  legColor: number;
  accentColor: number;
}

const palette = [
  0xff4d4f,
  0x3fa9f5,
  0xffc857,
  0x8e44ad,
  0x16a085,
  0xe67e22,
];

export function randomParts(): HeroSpriteParts {
  const color = () => palette[Math.floor(Math.random() * palette.length)];
  return {
    headColor: color(),
    torsoColor: color(),
    legColor: color(),
    accentColor: color(),
  };
}
