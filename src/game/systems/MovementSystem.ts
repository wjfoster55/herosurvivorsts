import { Enemy } from '../entities/Enemy';
import { Tuning } from '../tuning';

export class MovementSystem {
  update(enemies: Enemy[], targetX: number, targetY: number, delta: number, aggroFactor = 1) {
    this.applyStatus(enemies, delta);
    this.applySeparation(enemies, delta);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (enemy.hp <= 0 || enemy.stunTimer > 0) continue;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const len = Math.hypot(dx, dy) || 1;
      const slowMod = enemy.slowTimer > 0 ? enemy.slowAmount : 1;
      const step = enemy.speed * slowMod * aggroFactor * delta;
      enemy.x += (dx / len) * step;
      enemy.y += (dy / len) * step;
    }
  }

  private applyStatus(enemies: Enemy[], delta: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
      enemy.stunTimer = Math.max(0, enemy.stunTimer - delta);
      if (enemy.burnTimer > 0) {
        enemy.burnTimer = Math.max(0, enemy.burnTimer - delta);
        enemy.hp -= enemy.burnDamage * delta;
      }
    }
  }

  private applySeparation(enemies: Enemy[], delta: number) {
    const desired = Tuning.enemies.separationRadius;
    const desired2 = desired * desired;
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (a.hp <= 0) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j];
        if (b.hp <= 0) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 >= desired2) continue;
        const dist = Math.sqrt(dist2) || 1;
        const push = (Tuning.enemies.separationForce * delta) / dist;
        const px = (dx / dist) * push;
        const py = (dy / dist) * push;
        b.x += px;
        b.y += py;
        a.x -= px;
        a.y -= py;
      }
    }
  }
}
