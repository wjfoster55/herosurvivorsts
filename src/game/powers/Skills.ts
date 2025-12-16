import { Hero } from '../party/Hero';

export interface LevelUpSkill {
  id: string;
  name: string;
  description: string;
  apply: (hero: Hero) => void;
}

export function buffDamage(amount: number): LevelUpSkill {
  return {
    id: `dmg-${amount}`,
    name: `+${amount} Damage`,
    description: `Boost basic damage by ${amount}.`,
    apply: (hero) => {
      hero.stats.damage += amount;
    },
  };
}

export function buffAttackRate(percent: number): LevelUpSkill {
  return {
    id: `rate-${percent}`,
    name: `+${percent}% Attack Rate`,
    description: 'Faster basic attacks.',
    apply: (hero) => {
      hero.stats.attackRate *= 1 + percent / 100;
    },
  };
}

export function buffRange(amount: number): LevelUpSkill {
  return {
    id: `range-${amount}`,
    name: `+${amount} Range`,
    description: 'Attacks reach further.',
    apply: (hero) => {
      hero.stats.range += amount;
    },
  };
}

export function buffHp(amount: number): LevelUpSkill {
  return {
    id: `hp-${amount}`,
    name: `+${amount} Max HP`,
    description: 'Tougher hero.',
    apply: (hero) => {
      hero.stats.maxHp += amount;
      hero.currentHp += amount;
    },
  };
}
