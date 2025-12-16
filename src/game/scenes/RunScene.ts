import { Container, Graphics } from 'pixi.js';
import { Game } from '../Game';
import { Scene } from '../SceneManager';
import { Enemy } from '../entities/Enemy';
import { Pickup, createPickup } from '../entities/Pickup';
import { Party } from '../party/Party';
import { POWERS, randomPowerset } from '../powers/PowersetRegistry';
import { PowersetId } from '../powers/PowersetId';
import { CombatSystem } from '../systems/CombatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { BackgroundRenderer } from '../render/BackgroundRenderer';
import { HeroRenderer } from '../render/HeroRenderer';
import { RunHud } from './RunHud';

export class RunScene implements Scene {
  private game: Game;
  private party: Party;
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private background = new BackgroundRenderer();
  private heroRenderer = new HeroRenderer();
  private world = new Container();
  private enemyGraphics: Graphics[] = [];
  private pickupGraphics: Graphics[] = [];
  private hud = new RunHud();

  private movement = new MovementSystem();
  private combat = new CombatSystem();
  private collision = new CollisionSystem();
  private spawn = new SpawnSystem();
  private levelSystem = new LevelSystem();
  private delta = 0;

  constructor(game: Game, starterPowerset: PowersetId) {
    this.game = game;
    const powers: [PowersetId, PowersetId, PowersetId] = [
      starterPowerset,
      randomPowerset(),
      randomPowerset(),
    ];
    this.party = new Party(powers);
    this.party.activeHero.position = { x: 0, y: 0 };
    this.party.layoutHeroes();
  }

  enter(): void {
    this.game.renderer.clearLayers();
    const { entityLayer, uiLayer, backgroundLayer } = this.game.renderer;
    backgroundLayer.addChild(this.background.container);
    entityLayer.addChild(this.world);
    entityLayer.addChild(this.heroRenderer.container);
    uiLayer.addChild(this.hud.container);
    this.buildHeroes();
  }

  exit(): void {
    this.world.removeFromParent();
    this.heroRenderer.container.removeFromParent();
    this.hud.container.removeFromParent();
    this.background.container.removeFromParent();
  }

  private buildHeroes() {
    this.heroRenderer.container.removeChildren();
    for (const hero of this.party.heroes) {
      const sprite = this.heroRenderer.createHeroSprite(hero.parts);
      this.heroRenderer.container.addChild(sprite);
    }
  }

  private updateHeroSprites() {
    const center = this.party.getPartyCenter();
    this.party.layoutHeroes();
    this.heroRenderer.container.children.forEach((child, idx) => {
      const hero = this.party.heroes[idx];
      const sprite = child as Graphics;
      const angle = Math.atan2(center.y - hero.position.y, center.x - hero.position.x);
      this.heroRenderer.positionSprite(sprite, hero.position.x, hero.position.y, angle + Math.PI / 2);
      sprite.alpha = idx === this.party.activeIndex ? 1 : 0.75;
    });
  }

  private updateCamera(center: { x: number; y: number }) {
    const { width, height } = this.game.renderer.app.renderer;
    this.world.position.set(width / 2 - center.x, height / 2 - center.y);
    this.heroRenderer.container.position.set(this.world.position.x, this.world.position.y);
    this.background.update(center.x, center.y);
  }

  private renderEnemies() {
    const needed = this.enemies.length;
    while (this.enemyGraphics.length < needed) {
      const g = new Graphics();
      g.circle(0, 0, 14).fill(0xc0392b).stroke({ color: 0xffffff, width: 2, alpha: 0.3 });
      this.world.addChild(g);
      this.enemyGraphics.push(g);
    }
    for (let i = 0; i < this.enemyGraphics.length; i++) {
      const g = this.enemyGraphics[i];
      if (i >= this.enemies.length) {
        g.visible = false;
        continue;
      }
      const enemy = this.enemies[i];
      g.visible = enemy.hp > 0;
      g.position.set(enemy.x, enemy.y);
    }
  }

  private renderPickups() {
    const needed = this.pickups.length;
    while (this.pickupGraphics.length < needed) {
      const g = new Graphics();
      g.circle(0, 0, 8).fill(0x2980b9).stroke({ color: 0xffffff, width: 1 });
      this.world.addChild(g);
      this.pickupGraphics.push(g);
    }
    for (let i = 0; i < this.pickupGraphics.length; i++) {
      const g = this.pickupGraphics[i];
      if (i >= this.pickups.length) {
        g.visible = false;
        continue;
      }
      const pickup = this.pickups[i];
      g.visible = true;
      g.position.set(pickup.x, pickup.y);
    }
  }

  private handleSwap() {
    const input = this.game.input;
    if (input.wasPressed(' ') || input.wasPressed('space') || input.wasPressed('shift')) {
      if (this.party.swap()) {
        const hero = this.party.activeHero;
        POWERS[hero.powerset].swapSkill(hero, this.enemies);
      }
    }
    this.party.updateSwapCooldown(this.delta);
  }

  update(deltaMs: number): void {
    this.delta = deltaMs / 1000;
    if (this.levelSystem.pausedForChoice) {
      this.handleLevelSelection();
      this.hud.update(this.party, this.levelSystem);
      this.game.input.endFrame();
      return;
    }

    const center = this.party.getPartyCenter();
    this.handleSwap();
    this.spawn.update(this.enemies, center.x, center.y, this.delta);
    this.movement.update(this.enemies, center.x, center.y, this.delta);

    this.combat.processAttacks(this.party, this.enemies, this.delta, (_enemy, index) => {
      this.pickups.push(createPickup(this.enemies[index].x, this.enemies[index].y, 12));
      this.enemies.splice(index, 1);
    });

    this.collision.handleEnemyContact(this.party, this.enemies, this.delta);
    this.collision.collectPickups(this.party, this.pickups, (pickup, idx) => {
      const pool = POWERS[this.party.activeHero.powerset].levelUpSkills;
      this.levelSystem.addXp(pickup.value, pool);
      this.pickups.splice(idx, 1);
    });

    this.cleanDeadEnemies();
    this.updateHeroSprites();
    this.renderEnemies();
    this.renderPickups();
    this.updateCamera(center);
    this.hud.update(this.party, this.levelSystem);
    this.game.input.endFrame();
  }

  private cleanDeadEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        this.pickups.push(createPickup(this.enemies[i].x, this.enemies[i].y, 10));
        this.enemies.splice(i, 1);
      }
    }
  }

  private handleLevelSelection() {
    const input = this.game.input;
    for (let i = 0; i < this.levelSystem.pendingChoices.length; i++) {
      if (input.wasPressed((i + 1).toString())) {
        const choice = this.levelSystem.selectChoice(i);
        choice.apply(this.party.activeHero);
      }
    }
  }
}
