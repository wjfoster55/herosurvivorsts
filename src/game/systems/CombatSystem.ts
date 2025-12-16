import { Enemy } from '../entities/Enemy';
import { Projectile, ProjectileEffect, ProjectileKind } from '../entities/Projectile';
import { Party } from '../party/Party';
import { PowersetId } from '../powers/PowersetId';
import { ProjectileSystem } from './ProjectileSystem';
import { Tuning } from '../tuning';

export class CombatSystem {
  private lastAim = { x: 1, y: 0 };

  update(
    party: Party,
    enemies: Enemy[],
    projectiles: ProjectileSystem,
    delta: number,
    onEnemyKilled: (enemy: Enemy, index: number) => void
  ) {
    for (let i = 0; i < party.heroes.length; i++) {
      const hero = party.heroes[i];
      const isActive = i === party.activeIndex;
      const rate = isActive ? hero.stats.attackRate : hero.stats.followerRate;
      hero.attackTimer += delta;
      const interval = 1 / Math.max(0.01, rate);
      if (hero.attackTimer < interval) continue;
      hero.attackTimer -= interval;

      const target = this.findTarget(enemies, hero.position.x, hero.position.y, hero.stats.range);
      if (target) {
        this.lastAim = target.direction;
      }

      if (isActive) {
        this.firePrimary(hero, i, target, projectiles);
      } else {
        this.fireFollower(hero, i, target, projectiles);
      }
    }

    projectiles.update(enemies, delta, onEnemyKilled);
  }

  private findTarget(enemies: Enemy[], x: number, y: number, range: number) {
    let bestIndex = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let e = 0; e < enemies.length; e++) {
      const enemy = enemies[e];
      if (enemy.hp <= 0) continue;
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < range * range && dist2 < bestDist) {
        bestIndex = e;
        bestDist = dist2;
      }
    }
    if (bestIndex === -1) return null;
    const enemy = enemies[bestIndex];
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    const len = Math.hypot(dx, dy) || 1;
    return { index: bestIndex, direction: { x: dx / len, y: dy / len }, distance: Math.sqrt(bestDist) };
  }

  private firePrimary(
    hero: Party['heroes'][number],
    heroIndex: number,
    target: ReturnType<CombatSystem['findTarget']>,
    projectiles: ProjectileSystem
  ) {
    const dir = target ? target.direction : this.lastAim;
    switch (hero.powerset) {
      case PowersetId.Web:
        this.spawnBasic(heroIndex, hero, dir, projectiles, {
          slowAmount: hero.power.slowAmount,
          slowDuration: hero.power.slowDuration,
        });
        break;
      case PowersetId.Shock:
        this.spawnPiercing(heroIndex, hero, dir, projectiles, {
          chainCount: hero.power.chainCount,
          chainRadius: hero.power.chainRadius,
          chainDamage: hero.stats.damage * 0.5,
        });
        break;
      case PowersetId.Shadow:
        this.spawnBoomerang(heroIndex, hero, dir, projectiles, {
          critChance: hero.power.critChance,
          critMultiplier: hero.power.critMultiplier + hero.power.backstabBonus,
        });
        break;
      case PowersetId.Fire:
      default:
        this.spawnShotgun(heroIndex, hero, dir, projectiles, {
          burnDamage: hero.power.burnDamage,
          burnDuration: hero.power.burnDuration,
        });
        break;
    }
  }

  private fireFollower(
    hero: Party['heroes'][number],
    heroIndex: number,
    target: ReturnType<CombatSystem['findTarget']>,
    projectiles: ProjectileSystem
  ) {
    if (!target || target.distance > Tuning.combat.followerRange) return;
    const dir = target.direction;
    const damage = hero.stats.damage * Tuning.combat.followerDamageScale;
    const projectile: Projectile = {
      kind: ProjectileKind.Basic,
      x: hero.position.x,
      y: hero.position.y,
      vx: dir.x * Tuning.projectiles.baseSpeed,
      vy: dir.y * Tuning.projectiles.baseSpeed,
      radius: Tuning.projectiles.baseRadius * 0.8,
      damage,
      lifetime: Tuning.projectiles.life,
      pierce: 1,
      fromHero: heroIndex,
      source: hero.powerset,
    };
    projectiles.spawn(projectile);
  }

  private spawnBasic(
    heroIndex: number,
    hero: Party['heroes'][number],
    dir: { x: number; y: number },
    projectiles: ProjectileSystem,
    effect?: ProjectileEffect
  ) {
    const projectile: Projectile = {
      kind: ProjectileKind.Basic,
      x: hero.position.x,
      y: hero.position.y,
      vx: dir.x * Tuning.projectiles.baseSpeed,
      vy: dir.y * Tuning.projectiles.baseSpeed,
      radius: Tuning.projectiles.baseRadius * hero.power.projectileScale,
      damage: hero.stats.damage,
      lifetime: Tuning.projectiles.life,
      pierce: 1,
      fromHero: heroIndex,
      source: hero.powerset,
      effect,
    };
    projectiles.spawn(projectile);
  }

  private spawnPiercing(
    heroIndex: number,
    hero: Party['heroes'][number],
    dir: { x: number; y: number },
    projectiles: ProjectileSystem,
    effect?: ProjectileEffect
  ) {
    const projectile: Projectile = {
      kind: ProjectileKind.Piercing,
      x: hero.position.x,
      y: hero.position.y,
      vx: dir.x * (Tuning.projectiles.baseSpeed * 0.95),
      vy: dir.y * (Tuning.projectiles.baseSpeed * 0.95),
      radius: Tuning.projectiles.baseRadius * 0.9,
      damage: hero.stats.damage * 0.9,
      lifetime: Tuning.projectiles.life,
      pierce: 3,
      fromHero: heroIndex,
      source: hero.powerset,
      effect,
    };
    projectiles.spawn(projectile);
  }

  private spawnBoomerang(
    heroIndex: number,
    hero: Party['heroes'][number],
    dir: { x: number; y: number },
    projectiles: ProjectileSystem,
    effect?: ProjectileEffect
  ) {
    const speed = Tuning.projectiles.baseSpeed * 0.75;
    const projectile: Projectile = {
      kind: ProjectileKind.Boomerang,
      x: hero.position.x,
      y: hero.position.y,
      vx: dir.x * speed,
      vy: dir.y * speed,
      radius: Tuning.projectiles.baseRadius,
      damage: hero.stats.damage * 1.1,
      lifetime: Tuning.projectiles.boomerangLife,
      pierce: 2,
      fromHero: heroIndex,
      source: hero.powerset,
      maxTravel: hero.stats.range,
      traveled: 0,
      returning: false,
      originX: hero.position.x,
      originY: hero.position.y,
      effect,
    };
    projectiles.spawn(projectile);
  }

  private spawnShotgun(
    heroIndex: number,
    hero: Party['heroes'][number],
    dir: { x: number; y: number },
    projectiles: ProjectileSystem,
    effect?: ProjectileEffect
  ) {
    const baseAngle = Math.atan2(dir.y, dir.x);
    const spread = 0.22;
    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + spread * i;
      const vx = Math.cos(angle) * (Tuning.projectiles.baseSpeed * 0.82);
      const vy = Math.sin(angle) * (Tuning.projectiles.baseSpeed * 0.82);
      const projectile: Projectile = {
        kind: ProjectileKind.Shot,
        x: hero.position.x,
        y: hero.position.y,
        vx,
        vy,
        radius: Tuning.projectiles.baseRadius * hero.power.projectileScale,
        damage: hero.stats.damage * 0.85,
        lifetime: Tuning.projectiles.life,
        pierce: 1,
        fromHero: heroIndex,
        source: hero.powerset,
        effect,
      };
      projectiles.spawn(projectile);
    }
  }
}
