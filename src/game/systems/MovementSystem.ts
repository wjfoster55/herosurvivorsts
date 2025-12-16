import { Enemy } from '../entities/Enemy';

export class MovementSystem {
  update(enemies: Enemy[], targetX: number, targetY: number, delta: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
      enemy.stunTimer = Math.max(0, enemy.stunTimer - delta);
      if (enemy.burnTimer > 0) {
        enemy.burnTimer = Math.max(0, enemy.burnTimer - delta);
        enemy.hp -= enemy.burnDamage * delta;
      }

      if (enemy.hp <= 0) continue;

      if (enemy.stunTimer > 0) {
        continue;
      }

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const len = Math.hypot(dx, dy) || 1;
      const modifier = enemy.slowTimer > 0 ? 0.5 : 1;
      const step = enemy.speed * modifier * delta;
      enemy.x += (dx / len) * step;
      enemy.y += (dy / len) * step;
    }
  }
}
