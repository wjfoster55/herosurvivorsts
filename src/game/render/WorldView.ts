import { Container, Graphics } from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { POWERS } from '../powers/PowersetRegistry';
import { Hero } from '../party/Hero';
import { Tuning } from '../tuning';

export class WorldView {
  readonly world = new Container();
  readonly effects = new Graphics();
  readonly vignette = new Graphics();
  private enemyGraphics: Graphics[] = [];
  private pickupGraphics: Graphics[] = [];
  private projectileGraphics: Graphics[] = [];

  constructor() {
    this.world.addChild(this.effects);
  }

  updateCamera(camera: { x: number; y: number }, renderer: { width: number; height: number }) {
    this.world.position.set(renderer.width / 2 - camera.x, renderer.height / 2 - camera.y);
  }

  renderEnemies(enemies: Enemy[]) {
    const needed = enemies.length;
    while (this.enemyGraphics.length < needed) {
      const g = new Graphics();
      g.circle(0, 0, 14).fill(0xc0392b).stroke({ color: 0xffffff, width: 2, alpha: 0.3 });
      this.world.addChild(g);
      this.enemyGraphics.push(g);
    }
    for (let i = 0; i < this.enemyGraphics.length; i++) {
      const g = this.enemyGraphics[i];
      if (i >= enemies.length) {
        g.visible = false;
        continue;
      }
      const enemy = enemies[i];
      g.visible = enemy.hp > 0;
      g.position.set(enemy.x, enemy.y);
      g.alpha = enemy.slowTimer > 0 ? 0.8 : 1;
    }
  }

  renderPickups(pickups: Pickup[]) {
    const needed = pickups.length;
    while (this.pickupGraphics.length < needed) {
      const g = new Graphics();
      g.circle(0, 0, 8).fill(0x2980b9).stroke({ color: 0xffffff, width: 1 });
      this.world.addChild(g);
      this.pickupGraphics.push(g);
    }
    for (let i = 0; i < this.pickupGraphics.length; i++) {
      const g = this.pickupGraphics[i];
      if (i >= pickups.length) {
        g.visible = false;
        continue;
      }
      const pickup = pickups[i];
      g.visible = true;
      g.position.set(pickup.x, pickup.y);
    }
  }

  renderProjectiles(projectiles: ProjectileSystem) {
    const shots = projectiles.projectiles;
    while (this.projectileGraphics.length < shots.length) {
      const g = new Graphics();
      this.world.addChild(g);
      this.projectileGraphics.push(g);
    }
    for (let i = 0; i < this.projectileGraphics.length; i++) {
      const g = this.projectileGraphics[i];
      if (i >= shots.length) {
        g.visible = false;
        continue;
      }
      const p = shots[i];
      const color = POWERS[p.source].color;
      g.clear();
      g.circle(0, 0, p.radius).fill(color).stroke({ color: 0xffffff, width: 1, alpha: 0.4 });
      g.position.set(p.x, p.y);
      g.visible = true;
    }
  }

  renderEffects(hero: Hero, swapRingTimer: number, swapFlashTimer: number) {
    this.effects.clear();
    if (swapRingTimer > 0) {
      const alpha = swapRingTimer / Tuning.combat.swapRingDuration;
      const radius = POWERS[hero.powerset].swapRadius;
      this.effects.circle(hero.position.x, hero.position.y, radius).stroke({ color: POWERS[hero.powerset].color, width: 4, alpha });
    }
    if (hero.invisibleTimer > 0) {
      this.effects.circle(hero.position.x, hero.position.y, 20).stroke({ color: 0xffffff, width: 2, alpha: 0.25 });
    }
    this.vignette.clear();
    if (swapFlashTimer > 0) {
      const alpha = swapFlashTimer / Tuning.combat.swapFlashDuration;
      this.vignette.rect(0, 0, window.innerWidth, window.innerHeight).fill({ color: 0xffffff, alpha: 0.05 * alpha });
    }
  }
}
