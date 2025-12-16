import { Enemy } from '../entities/Enemy';
import { Hero } from '../party/Hero';
import { PowersetId } from './PowersetId';
import { LevelUpSkill, buffAttackRate, buffDamage, buffHp, buffRange } from './Skills';

export interface PowersetData {
  id: PowersetId;
  name: string;
  color: number;
  swapSkill: (hero: Hero, enemies: Enemy[]) => void;
  levelUpSkills: LevelUpSkill[];
}

function affectEnemies(hero: Hero, enemies: Enemy[], radius: number, fn: (enemy: Enemy) => void) {
  const { x, y } = hero.position;
  const r2 = radius * radius;
  for (const enemy of enemies) {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    if (dx * dx + dy * dy <= r2) {
      fn(enemy);
    }
  }
}

export const POWERS: Record<PowersetId, PowersetData> = {
  [PowersetId.Web]: {
    id: PowersetId.Web,
    name: 'Web',
    color: 0x5dade2,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 140, (enemy) => {
        enemy.hp -= 10 + hero.stats.damage * 0.3;
        enemy.slowTimer = 2;
      });
    },
    levelUpSkills: [buffDamage(3), buffAttackRate(15), buffRange(20)],
  },
  [PowersetId.Shock]: {
    id: PowersetId.Shock,
    name: 'Shock',
    color: 0xf1c40f,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 120, (enemy) => {
        enemy.hp -= 14 + hero.stats.damage * 0.5;
        enemy.stunTimer = 0.8;
      });
    },
    levelUpSkills: [buffAttackRate(20), buffDamage(4), buffHp(10)],
  },
  [PowersetId.Shadow]: {
    id: PowersetId.Shadow,
    name: 'Shadow',
    color: 0x9b59b6,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 110, (enemy) => {
        enemy.hp -= 12;
      });
      hero.currentHp = Math.min(hero.stats.maxHp, hero.currentHp + 8);
    },
    levelUpSkills: [buffHp(12), buffDamage(3), buffRange(18)],
  },
  [PowersetId.Fire]: {
    id: PowersetId.Fire,
    name: 'Fire',
    color: 0xe74c3c,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 150, (enemy) => {
        enemy.hp -= 10;
        enemy.burnTimer = 3;
        enemy.burnDamage = 2 + hero.stats.damage * 0.2;
      });
    },
    levelUpSkills: [buffDamage(5), buffAttackRate(10), buffRange(15)],
  },
};

export function randomPowerset(): PowersetId {
  const ids = Object.keys(POWERS) as PowersetId[];
  return ids[Math.floor(Math.random() * ids.length)];
}
