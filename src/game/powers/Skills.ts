import { Hero } from '../party/Hero';

export interface LevelUpSkill {
  id: string;
  name: string;
  description: string;
  apply: (hero: Hero) => void;
  preview: (hero: Hero) => string;
}

export function buffDamage(amount: number): LevelUpSkill {
  return {
    id: `dmg-${amount}`,
    name: `+${amount} Damage`,
    description: `Boost basic damage by ${amount}.`,
    apply: (hero) => {
      hero.stats.damage += amount;
    },
    preview: (hero) => `Damage ${hero.stats.damage.toFixed(1)} → ${(hero.stats.damage + amount).toFixed(1)}`,
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
    preview: (hero) => {
      const current = hero.stats.attackRate;
      const next = current * (1 + percent / 100);
      return `Rate ${current.toFixed(2)} → ${next.toFixed(2)}`;
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
    preview: (hero) => `Range ${hero.stats.range} → ${hero.stats.range + amount}`,
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
    preview: (hero) => `HP ${hero.stats.maxHp} → ${hero.stats.maxHp + amount}`,
  };
}
