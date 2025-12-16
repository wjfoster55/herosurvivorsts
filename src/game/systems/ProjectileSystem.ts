import { Enemy } from '../entities/Enemy';
import { Projectile, ProjectileEffect, ProjectileKind } from '../entities/Projectile';
import { Tuning } from '../tuning';

export type OnEnemyKilled = (enemy: Enemy, index: number, sourceHero?: number) => void;

export class ProjectileSystem {
  readonly projectiles: Projectile[] = [];

  spawn(projectile: Projectile) {
    this.projectiles.push(projectile);
  }

  clear() {
    this.projectiles.length = 0;
  }

  update(enemies: Enemy[], delta: number, onEnemyKilled: OnEnemyKilled) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifetime -= delta;
      if (p.lifetime <= 0) {
        this.removeProjectile(i);
        continue;
      }

      if (p.kind === ProjectileKind.Boomerang) {
        this.updateBoomerang(p, delta);
      }

      p.x += p.vx * delta;
      p.y += p.vy * delta;

      if (this.handleCollisions(p, enemies, onEnemyKilled)) {
        if (p.pierce <= 0) {
          this.removeProjectile(i);
          continue;
        }
      }

      if (p.kind === ProjectileKind.Boomerang && p.returning && p.originX !== undefined && p.originY !== undefined) {
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        if (dx * dx + dy * dy < 24) {
          this.removeProjectile(i);
        }
      }
    }
  }

  private handleCollisions(projectile: Projectile, enemies: Enemy[], onEnemyKilled: OnEnemyKilled) {
    let hit = false;
    for (let e = enemies.length - 1; e >= 0; e--) {
      const enemy = enemies[e];
      if (enemy.hp <= 0) continue;
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const collide = projectile.radius + enemy.radius;
      if (dx * dx + dy * dy > collide * collide) continue;

      hit = true;
      const damage = this.computeDamage(projectile.damage, projectile.effect);
      enemy.hp -= damage;
      this.applyEffects(projectile.effect, enemy, enemies, e, onEnemyKilled, projectile.fromHero);
      projectile.pierce -= 1;
      if (enemy.hp <= 0) {
        onEnemyKilled(enemy, e, projectile.fromHero);
      }
      if (projectile.pierce <= 0) {
        break;
      }
    }
    return hit;
  }

  private computeDamage(base: number, effect?: ProjectileEffect) {
    if (!effect?.critChance || !effect.critMultiplier) return base;
    if (Math.random() < effect.critChance) {
      return base * effect.critMultiplier;
    }
    return base;
  }

  private applyEffects(
    effect: ProjectileEffect | undefined,
    enemy: Enemy,
    enemies: Enemy[],
    hitIndex: number,
    onEnemyKilled: OnEnemyKilled,
    sourceHero?: number
  ) {
    if (!effect) return;
    if (effect.slowDuration && effect.slowAmount) {
      enemy.slowTimer = Math.max(enemy.slowTimer, effect.slowDuration);
      enemy.slowAmount = Math.min(enemy.slowAmount, effect.slowAmount);
    }
    if (effect.burnDuration && effect.burnDamage) {
      enemy.burnTimer = Math.max(enemy.burnTimer, effect.burnDuration);
      enemy.burnDamage = Math.max(enemy.burnDamage, effect.burnDamage);
    }
    if (effect.chainCount && effect.chainRadius) {
      const radius2 = effect.chainRadius * effect.chainRadius;
      let remaining = effect.chainCount;
      for (let i = 0; i < enemies.length && remaining > 0; i++) {
        if (i === hitIndex) continue;
        const other = enemies[i];
        if (other.hp <= 0) continue;
        const dx = other.x - enemy.x;
        const dy = other.y - enemy.y;
        if (dx * dx + dy * dy <= radius2) {
          const damage = effect.chainDamage ?? enemy.damage * 0.25;
          other.hp -= Math.max(1, damage);
          remaining -= 1;
          if (other.hp <= 0) {
            onEnemyKilled(other, i, sourceHero);
          }
        }
      }
    }
  }

  private updateBoomerang(projectile: Projectile, delta: number) {
    const speed = Math.hypot(projectile.vx, projectile.vy);
    const travel = speed * delta;
    projectile.traveled = (projectile.traveled || 0) + travel;
    if (!projectile.returning && projectile.maxTravel && projectile.traveled >= projectile.maxTravel) {
      projectile.returning = true;
    }
    if (projectile.returning && projectile.originX !== undefined && projectile.originY !== undefined) {
      const dx = projectile.originX - projectile.x;
      const dy = projectile.originY - projectile.y;
      const len = Math.hypot(dx, dy) || 1;
      projectile.vx = (dx / len) * speed;
      projectile.vy = (dy / len) * speed;
    }
  }

  private removeProjectile(index: number) {
    this.projectiles.splice(index, 1);
  }
}
