import { Enemy } from '../entities/Enemy';
import { Hero } from '../party/Hero';
import { PowersetId } from './PowersetId';
import { LevelUpSkill, buffAttackRate, buffDamage, buffHp, buffRange } from './Skills';

export interface PowersetData {
  id: PowersetId;
  name: string;
  color: number;
  swapRadius: number;
  swapSkill: (hero: Hero, enemies: Enemy[]) => void;
  levelUpSkills: LevelUpSkill[];
}

function affectEnemies(hero: Hero, enemies: Enemy[], radius: number, fn: (enemy: Enemy) => void) {
  const { x, y } = hero.position;
  const r2 = radius * radius;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    if (dx * dx + dy * dy <= r2) {
      fn(enemy);
    }
  }
}

function skill(
  id: string,
  name: string,
  description: string,
  apply: (hero: Hero) => void,
  preview: (hero: Hero) => string
): LevelUpSkill {
  return { id, name, description, apply, preview };
}

function shockChain(hero: Hero, enemies: Enemy[], hits: number, radius: number, damage: number) {
  let currentIndex = -1;
  let currentX = hero.position.x;
  let currentY = hero.position.y;
  for (let hop = 0; hop < hits; hop++) {
    let best = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < enemies.length; i++) {
      if (i === currentIndex) continue;
      const enemy = enemies[i];
      if (enemy.hp <= 0) continue;
      const dx = enemy.x - currentX;
      const dy = enemy.y - currentY;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < radius * radius && dist2 < bestDist) {
        bestDist = dist2;
        best = i;
      }
    }
    if (best === -1) break;
    currentIndex = best;
    const target = enemies[best];
    target.hp -= damage;
    target.stunTimer = Math.max(target.stunTimer, 0.35);
    currentX = target.x;
    currentY = target.y;
  }
}

export const POWERS: Record<PowersetId, PowersetData> = {
  [PowersetId.Web]: {
    id: PowersetId.Web,
    name: 'Web',
    color: 0x5dade2,
    swapRadius: 150,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 150, (enemy) => {
        enemy.hp -= 8 + hero.stats.damage * 0.35;
        enemy.slowTimer = Math.max(enemy.slowTimer, hero.power.slowDuration + 0.5);
        enemy.slowAmount = Math.min(enemy.slowAmount, hero.power.slowAmount * 0.8);
      });
    },
    levelUpSkills: [
      buffDamage(3),
      buffRange(20),
      skill(
        'web-stickier',
        'Stickier Webs',
        'Swap slow lasts longer and basic hits chill harder.',
        (hero) => {
          hero.power.slowDuration += 0.5;
          hero.power.slowAmount = Math.max(0.3, hero.power.slowAmount - 0.05);
        },
        (hero) => `Slow ${hero.power.slowDuration.toFixed(1)}s → ${(hero.power.slowDuration + 0.5).toFixed(1)}s`
      ),
      skill(
        'web-wider',
        'Wider Nets',
        'Range and swap radius grow.',
        (hero) => {
          hero.power.projectileScale += 0.05;
          hero.stats.range += 18;
        },
        (hero) => `Range ${hero.stats.range} → ${hero.stats.range + 18}`
      ),
    ],
  },
  [PowersetId.Shock]: {
    id: PowersetId.Shock,
    name: 'Shock',
    color: 0xf1c40f,
    swapRadius: 140,
    swapSkill: (hero, enemies) => {
      shockChain(hero, enemies, hero.power.chainCount + 2, hero.power.chainRadius, hero.stats.damage * 1.1);
    },
    levelUpSkills: [
      buffAttackRate(15),
      skill(
        'shock-chain',
        'Extra Bounce',
        'Chain lightning leaps further.',
        (hero) => {
          hero.power.chainCount += 1;
          hero.power.chainRadius += 12;
        },
        (hero) => `Chains ${hero.power.chainCount + 2} → ${hero.power.chainCount + 3}`
      ),
      skill(
        'shock-cluster',
        'Cluster Bonus',
        'More splash damage to clustered foes.',
        (hero) => {
          hero.power.chainRadius += 20;
        },
        (hero) => `Chain radius ${hero.power.chainRadius} → ${hero.power.chainRadius + 20}`
      ),
      buffHp(10),
    ],
  },
  [PowersetId.Shadow]: {
    id: PowersetId.Shadow,
    name: 'Shadow',
    color: 0x9b59b6,
    swapRadius: 110,
    swapSkill: (hero, enemies) => {
      hero.invisibleTimer = 2.2;
      hero.aggroDropTimer = 1.4;
      affectEnemies(hero, enemies, 110, (enemy) => {
        enemy.hp -= 6 + hero.stats.damage * 0.3;
        enemy.stunTimer = Math.max(enemy.stunTimer, 0.2);
      });
    },
    levelUpSkills: [
      skill(
        'shadow-crit',
        'Killer Edge',
        'Higher crit chance and backstab bonus.',
        (hero) => {
          hero.power.critChance += 0.05;
          hero.power.backstabBonus += 0.1;
        },
        (hero) => `Crit ${(hero.power.critChance * 100).toFixed(0)}% → ${((hero.power.critChance + 0.05) * 100).toFixed(0)}%`
      ),
      buffDamage(3),
      buffRange(16),
      skill(
        'shadow-slip',
        'Slip Away',
        'Swap invisibility lasts longer.',
        (hero) => {
          hero.invisibleTimer += 0.4;
          hero.aggroDropTimer += 0.2;
        },
        (hero) => `Vanish ${hero.invisibleTimer.toFixed(1)}s → ${(hero.invisibleTimer + 0.4).toFixed(1)}s`
      ),
    ],
  },
  [PowersetId.Fire]: {
    id: PowersetId.Fire,
    name: 'Fire',
    color: 0xe74c3c,
    swapRadius: 170,
    swapSkill: (hero, enemies) => {
      affectEnemies(hero, enemies, 170, (enemy) => {
        enemy.hp -= hero.stats.damage * 0.8;
        enemy.burnTimer = Math.max(enemy.burnTimer, hero.power.burnDuration + 0.5);
        enemy.burnDamage = Math.max(enemy.burnDamage, hero.power.burnDamage + 1);
      });
    },
    levelUpSkills: [
      buffDamage(5),
      skill(
        'fire-fuel',
        'Fuel the Flame',
        'Burn ticks harder and longer.',
        (hero) => {
          hero.power.burnDamage += 1.2;
          hero.power.burnDuration += 0.4;
        },
        (hero) => `Burn ${hero.power.burnDamage.toFixed(1)} DPS → ${(hero.power.burnDamage + 1.2).toFixed(1)}`
      ),
      skill(
        'fire-radius',
        'Bigger Blasts',
        'Projectiles and nova expand.',
        (hero) => {
          hero.power.projectileScale += 0.1;
          hero.stats.range += 12;
        },
        (hero) => `Size ${(hero.power.projectileScale).toFixed(2)} → ${(hero.power.projectileScale + 0.1).toFixed(2)}`
      ),
      buffHp(12),
    ],
  },
};

export function randomPowerset(): PowersetId {
  const ids = Object.keys(POWERS) as PowersetId[];
  return ids[Math.floor(Math.random() * ids.length)];
}
