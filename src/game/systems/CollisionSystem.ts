import { Enemy } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { Party } from '../party/Party';

export class CollisionSystem {
  heroRadius = 16;

  handleEnemyContact(party: Party, enemies: Enemy[], delta: number) {
    const active = party.activeHero;
    if (active.invisibleTimer > 0) return;
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;
      const dx = enemy.x - active.position.x;
      const dy = enemy.y - active.position.y;
      const dist2 = dx * dx + dy * dy;
      const collideDist = this.heroRadius + enemy.radius;
      if (dist2 <= collideDist * collideDist) {
        active.currentHp = Math.max(0, active.currentHp - enemy.damage * delta);
      }
    }
  }

  collectPickups(party: Party, pickups: Pickup[], onCollected: (pickup: Pickup, index: number) => void) {
    const center = party.getPartyCenter();
    const collideDist = this.heroRadius + 12;
    const threshold = collideDist * collideDist;
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i];
      const dx = pickup.x - center.x;
      const dy = pickup.y - center.y;
      if (dx * dx + dy * dy <= threshold) {
        onCollected(pickup, i);
      }
    }
  }
}
