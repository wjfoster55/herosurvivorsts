import { Graphics } from 'pixi.js';
import { Game } from '../Game';
import { Scene } from '../SceneManager';
import { Enemy } from '../entities/Enemy';
import { Pickup, createPickup } from '../entities/Pickup';
import { Party } from '../party/Party';
import { POWERS, randomPowerset } from '../powers/PowersetRegistry';
import { PowersetId } from '../powers/PowersetId';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { BackgroundRenderer } from '../render/BackgroundRenderer';
import { HeroRenderer } from '../render/HeroRenderer';
import { RunHud } from './RunHud';
import { Tuning } from '../tuning';
import { WorldView } from '../render/WorldView';
import { PartyController } from '../systems/PartyController';

export class RunScene implements Scene {
  private game: Game;
  private party: Party;
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private projectiles = new ProjectileSystem();
  private background = new BackgroundRenderer();
  private heroRenderer = new HeroRenderer();
  private view = new WorldView();
  private hud = new RunHud();

  private movement = new MovementSystem();
  private combat = new CombatSystem();
  private collision = new CollisionSystem();
  private spawn = new SpawnSystem();
  private levelSystem = new LevelSystem();
  private partyController = new PartyController();
  private delta = 0;
  private camera = { x: 0, y: 0 };
  private swapFlashTimer = 0;
  private swapRingTimer = 0;
  private debugVisible = false;

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
    this.camera = { ...this.party.getPartyCenter() };
  }

  enter(): void {
    this.game.renderer.clearLayers();
    const { entityLayer, uiLayer, backgroundLayer } = this.game.renderer;
    backgroundLayer.addChild(this.background.container);
    entityLayer.addChild(this.view.world);
    entityLayer.addChild(this.heroRenderer.container);
    uiLayer.addChild(this.hud.container);
    uiLayer.addChild(this.view.vignette);
    this.hud.bindParty(this.party);
    this.buildHeroes();
  }

  exit(): void {
    this.view.world.removeFromParent();
    this.heroRenderer.container.removeFromParent();
    this.hud.container.removeFromParent();
    this.background.container.removeFromParent();
    this.view.vignette.removeFromParent();
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
    this.camera.x += (center.x - this.camera.x) * Tuning.camera.lerp;
    this.camera.y += (center.y - this.camera.y) * Tuning.camera.lerp;
    const { width, height } = this.game.renderer.app.renderer;
    this.view.updateCamera(this.camera, { width, height });
    this.heroRenderer.container.position.set(this.view.world.position.x, this.view.world.position.y);
    this.background.update(this.camera.x, this.camera.y);
  }

  private handleEnemyKilled = (enemy: Enemy, index: number, sourceHero?: number) => {
    if (sourceHero !== undefined) {
      const hero = this.party.heroes[sourceHero];
      if (hero.powerset === PowersetId.Fire && hero.power.burnExplosion > 0) {
        this.explode(enemy.x, enemy.y, 60, hero.power.burnExplosion);
      }
    }
    this.pickups.push(createPickup(enemy.x, enemy.y, 12));
    this.enemies.splice(index, 1);
  };

  private explode(x: number, y: number, radius: number, damage: number) {
    const r2 = radius * radius;
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      if (dx * dx + dy * dy <= r2) {
        enemy.hp -= damage;
      }
    }
  }

  update(deltaMs: number): void {
    this.delta = deltaMs / 1000;
    this.swapFlashTimer = Math.max(0, this.swapFlashTimer - this.delta);
    this.swapRingTimer = Math.max(0, this.swapRingTimer - this.delta);
    this.partyController.tickState(this.party, this.delta);

    if (this.levelSystem.pausedForChoice) {
      this.handleLevelSelection();
      this.hud.update(this.party, this.levelSystem);
      this.game.input.endFrame();
      return;
    }

    this.partyController.updateMovement(this.party, this.game.input, this.delta);
    const swapped = this.partyController.trySwap(this.party, this.game.input);
    if (swapped) {
      const hero = this.party.activeHero;
      POWERS[hero.powerset].swapSkill(hero, this.enemies);
      this.swapFlashTimer = Tuning.combat.swapFlashDuration;
      this.swapRingTimer = Tuning.combat.swapRingDuration;
    }
    const center = this.party.getPartyCenter();
    const aggroFactor = this.party.activeHero.aggroDropTimer > 0 ? 0.5 : 1;
    this.spawn.update(this.enemies, center.x, center.y, this.delta);
    this.movement.update(this.enemies, center.x, center.y, this.delta, aggroFactor);

    this.combat.update(this.party, this.enemies, this.projectiles, this.delta, this.handleEnemyKilled);

    this.collision.handleEnemyContact(this.party, this.enemies, this.delta);
    this.collision.collectPickups(this.party, this.pickups, (pickup, idx) => {
      const pool = POWERS[this.party.activeHero.powerset].levelUpSkills;
      this.levelSystem.addXp(pickup.value, pool);
      this.pickups.splice(idx, 1);
    });

    this.cleanDeadEnemies();
    this.updateHeroSprites();
    this.view.renderEnemies(this.enemies);
    this.view.renderPickups(this.pickups);
    this.view.renderProjectiles(this.projectiles);
    this.view.renderEffects(this.party.activeHero, this.swapRingTimer, this.swapFlashTimer);
    this.updateCamera(center);
    this.updateDebugToggle();
    this.hud.update(this.party, this.levelSystem, {
      fps: 1000 / deltaMs,
      enemies: this.enemies.length,
      projectiles: this.projectiles.projectiles.length,
      heroName: this.party.activeHero.name,
      damage: this.party.activeHero.stats.damage,
      attackRate: this.party.activeHero.stats.attackRate,
    });
    this.game.input.endFrame();
  }

  private updateDebugToggle() {
    if (this.game.input.wasPressed(Tuning.debug.toggleKey)) {
      this.debugVisible = !this.debugVisible;
      this.hud.setDebugVisible(this.debugVisible);
    }
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
    if (input.wasPressed('escape') || input.wasPressed('esc')) {
      this.levelSystem.skipChoice();
    }
  }
}
