import { Container, Graphics, Text } from 'pixi.js';
import { Party } from '../party/Party';
import { POWERS } from '../powers/PowersetRegistry';
import { LevelSystem } from '../systems/LevelSystem';

export class RunHud {
  container = new Container();
  private xpBarFill = new Graphics();
  private heroText!: Text;
  private hpText!: Text;
  private levelText!: Text;
  private levelChoices: Text[] = [];

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
    this.container.addChild(xpBack, this.xpBarFill);
  }

  update(party: Party, levelSystem: LevelSystem) {
    const hero = party.activeHero;
    const power = POWERS[hero.powerset];
    this.heroText.text = `Active: ${hero.name} (${power.name})`;
    this.hpText.text = `HP: ${hero.currentHp.toFixed(1)} / ${hero.stats.maxHp}`;
    this.levelText.text = `Level ${levelSystem.level}  •  XP ${Math.floor(levelSystem.xp)} / ${levelSystem.xpToNext}`;
    const pct = Math.min(1, levelSystem.xp / levelSystem.xpToNext);
    this.xpBarFill.width = 240 * pct;
    this.drawLevelChoices(levelSystem);
  }

  private drawLevelChoices(levelSystem: LevelSystem) {
    this.levelChoices.forEach((t) => t.removeFromParent());
    this.levelChoices = [];
    if (!levelSystem.pausedForChoice) return;
    levelSystem.pendingChoices.forEach((skill, idx) => {
      const text = new Text({
        text: `${idx + 1}. ${skill.name} — ${skill.description}`,
        style: { fill: '#ecf0f1', fontSize: 16, fontWeight: '600' },
      });
      text.position.set(20, 150 + idx * 28);
      this.container.addChild(text);
      this.levelChoices.push(text);
    });
  }
}
