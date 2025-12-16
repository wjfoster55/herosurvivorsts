import { Enemy, createEnemy } from '../entities/Enemy';

export class SpawnSystem {
  private timer = 0;
  private interval = 1.2;
  private elapsed = 0;

  update(enemies: Enemy[], centerX: number, centerY: number, delta: number) {
    this.timer += delta;
    this.elapsed += delta;
    const currentInterval = Math.max(0.45, this.interval - this.elapsed * 0.01);
    if (this.timer >= currentInterval) {
      this.timer -= currentInterval;
      const angle = Math.random() * Math.PI * 2;
      const distance = 420 + Math.random() * 220;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      enemies.push(createEnemy(x, y));
    }
  }
}
