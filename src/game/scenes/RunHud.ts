import { Container, Graphics, Text } from 'pixi.js';
import { Party } from '../party/Party';
import { POWERS } from '../powers/PowersetRegistry';
import { LevelSystem } from '../systems/LevelSystem';

interface PortraitUi {
  frame: Graphics;
  fill: Graphics;
  label: Text;
}

interface DebugInfo {
  fps: number;
  enemies: number;
  projectiles: number;
  heroName: string;
  damage: number;
  attackRate: number;
}

export class RunHud {
  container = new Container();
  private xpBarFill = new Graphics();
  private heroText!: Text;
  private hpText!: Text;
  private levelText!: Text;
  private levelChoices: (Graphics | Text)[] = [];
  private overlay = new Graphics();
  private portraits: PortraitUi[] = [];
  private debugText = new Text({ text: '', style: { fill: '#9ca3af', fontSize: 14 } });
  private overlayVisible = false;
  private debugVisible = false;

  constructor() {
    this.buildUi();
  }

  private buildUi() {
    const title = new Text({ text: 'RUN', style: { fill: '#f5f6fa', fontSize: 22, fontWeight: '700' } });
    title.position.set(20, 12);
    this.container.addChild(title);

    this.heroText = new Text({ text: '', style: { fill: '#f1c40f', fontSize: 18 } });
    this.heroText.position.set(20, 44);
    this.container.addChild(this.heroText);

    this.hpText = new Text({ text: '', style: { fill: '#ffffff', fontSize: 16 } });
    this.hpText.position.set(20, 70);
    this.container.addChild(this.hpText);

    this.levelText = new Text({ text: '', style: { fill: '#9ca3af', fontSize: 14 } });
    this.levelText.position.set(20, 94);
    this.container.addChild(this.levelText);

    const xpBack = new Graphics();
    xpBack.roundRect(20, 120, 240, 14, 6).fill(0x2c2f3a);
    this.xpBarFill.roundRect(20, 120, 240, 14, 6).fill(0x27ae60);
    this.container.addChild(xpBack, this.xpBarFill, this.overlay, this.debugText);

    this.debugText.position.set(20, 200);
  }

  bindParty(party: Party) {
    this.portraits.forEach((p) => p.frame.removeFromParent());
    this.portraits = [];
    const originX = 20;
    const originY = 150;
    for (let i = 0; i < party.heroes.length; i++) {
      const hero = party.heroes[i];
      const power = POWERS[hero.powerset];
      const frame = new Graphics();
      frame.roundRect(originX + i * 70, originY, 60, 60, 8).fill(0x11131d).stroke({ color: power.color, width: 2 });
      const fill = new Graphics();
      fill.roundRect(originX + i * 70 + 6, originY + 42, 48, 12, 5).fill(power.color).alpha = 0.6;
      const label = new Text({ text: hero.name[0], style: { fill: '#f5f6fa', fontSize: 20, fontWeight: '700' } });
      label.position.set(originX + i * 70 + 22, originY + 12);
      this.container.addChild(frame, fill, label);
      this.portraits.push({ frame, fill, label });
    }
  }

  update(party: Party, levelSystem: LevelSystem, debugInfo?: DebugInfo) {
    const hero = party.activeHero;
    const power = POWERS[hero.powerset];
    this.heroText.text = `Active: ${hero.name} (${power.name})`;
    this.hpText.text = `HP: ${hero.currentHp.toFixed(1)} / ${hero.stats.maxHp}`;
    this.levelText.text = `Level ${levelSystem.level}  •  XP ${Math.floor(levelSystem.xp)} / ${levelSystem.xpToNext}`;
    const pct = Math.min(1, levelSystem.xp / levelSystem.xpToNext);
    this.xpBarFill.width = 240 * pct;
    this.drawLevelChoices(levelSystem, hero);
    this.updatePortraits(party);
    this.updateOverlay(levelSystem.pausedForChoice);
    this.updateDebug(debugInfo);
  }

  setDebugVisible(flag: boolean) {
    this.debugVisible = flag;
    this.debugText.visible = flag;
  }

  private updateDebug(info?: DebugInfo) {
    if (!this.debugVisible || !info) return;
    this.debugText.text = `FPS ${info.fps.toFixed(1)}\nEnemies ${info.enemies}  •  Projectiles ${info.projectiles}\n${info.heroName}: DMG ${info.damage.toFixed(
      1
    )}  Rate ${info.attackRate.toFixed(2)}`;
  }

  private updatePortraits(party: Party) {
    for (let i = 0; i < this.portraits.length; i++) {
      const ui = this.portraits[i];
      const hero = party.heroes[i];
      const ready = party.swapCooldown <= 0;
      ui.frame.alpha = i === party.activeIndex ? 1 : 0.6;
      const pct = Math.max(0, Math.min(1, party.swapCooldown / party.swapCooldownDuration));
      ui.fill.width = 48 * (ready ? 1 : 1 - pct);
      ui.fill.alpha = ready ? 0.9 : 0.4;
      ui.label.text = hero.name[0];
    }
  }

  private updateOverlay(visible: boolean) {
    if (this.overlayVisible === visible) return;
    this.overlayVisible = visible;
    this.overlay.clear();
    if (!visible) return;
    this.overlay.rect(0, 0, window.innerWidth, window.innerHeight).fill({ color: 0x0b0d14, alpha: 0.6 });
  }

  private drawLevelChoices(levelSystem: LevelSystem, hero: Party['heroes'][number]) {
    if (!levelSystem.pausedForChoice) {
      this.levelChoices.forEach((t) => t.removeFromParent());
      this.levelChoices = [];
      return;
    }
    if (this.levelChoices.length > 0) return;
    const panel = new Graphics();
    panel.roundRect(60, 200, window.innerWidth - 120, 200, 16).fill({ color: 0x161926, alpha: 0.9 });
    this.container.addChild(panel);
    for (let i = 0; i < levelSystem.pendingChoices.length; i++) {
      const skill = levelSystem.pendingChoices[i];
      const baseY = 220 + i * 60;
      const title = new Text({ text: `${i + 1}. ${skill.name}`, style: { fill: '#f5f6fa', fontSize: 18, fontWeight: '700' } });
      title.position.set(80, baseY);
      const desc = new Text({ text: skill.description, style: { fill: '#cfd3db', fontSize: 14 } });
      desc.position.set(80, baseY + 22);
      const preview = new Text({ text: skill.preview(hero), style: { fill: '#9ca3af', fontSize: 13 } });
      preview.position.set(80, baseY + 38);
      this.container.addChild(title, desc, preview);
      this.levelChoices.push(title, desc, preview);
    }
    const hint = new Text({ text: '1/2/3: choose • Esc: skip', style: { fill: '#8e9ba8', fontSize: 13 } });
    hint.position.set(80, 380);
    this.container.addChild(hint);
    this.levelChoices.push(panel, hint);
  }
}
