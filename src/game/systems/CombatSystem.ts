import { Enemy } from '../entities/Enemy';
import { Party } from '../party/Party';

export class CombatSystem {
  processAttacks(party: Party, enemies: Enemy[], delta: number, onEnemyKilled: (enemy: Enemy, index: number) => void) {
    for (let i = 0; i < party.heroes.length; i++) {
      const hero = party.heroes[i];
      const isActive = i === party.activeIndex;
      const rate = isActive ? hero.stats.attackRate : hero.stats.followerRate;
      hero.attackTimer += delta;
      const interval = 1 / Math.max(0.01, rate);
      if (hero.attackTimer < interval) continue;
      hero.attackTimer -= interval;

      let bestIndex = -1;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let e = 0; e < enemies.length; e++) {
        const enemy = enemies[e];
        if (enemy.hp <= 0) continue;
        const dx = enemy.x - hero.position.x;
        const dy = enemy.y - hero.position.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < hero.stats.range * hero.stats.range && dist2 < bestDist) {
          bestDist = dist2;
          bestIndex = e;
        }
      }

      if (bestIndex >= 0) {
        const enemy = enemies[bestIndex];
        const damage = isActive ? hero.stats.damage : hero.stats.damage * 0.6;
        enemy.hp -= damage;
        if (enemy.hp <= 0) {
          onEnemyKilled(enemy, bestIndex);
        }
      }
    }
  }
}
