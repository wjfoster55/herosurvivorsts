import { Tuning } from '../tuning';
import { PowersetId } from '../powers/PowersetId';
import { Hero, HeroStats } from './Hero';

export class Party {
  heroes: Hero[];
  activeIndex = 0;
  swapCooldown = 0;
  readonly swapCooldownDuration = Tuning.combat.swapCooldown;

  constructor(powersets: [PowersetId, PowersetId, PowersetId]) {
    const baseStats: HeroStats = {
      maxHp: 60,
      damage: 8,
      attackRate: 0.9,
      followerRate: 1.6,
      range: 140,
      moveSpeed: 160,
    };
    this.heroes = [
      new Hero('Rookie', powersets[0], { ...baseStats }),
      new Hero('Specialist', powersets[1], { ...baseStats, attackRate: 1.2, followerRate: 1.4 }),
      new Hero('Ace', powersets[2], { ...baseStats, damage: 10, attackRate: 1.1 }),
    ];
    this.layoutHeroes();
  }

  get activeHero() {
    return this.heroes[this.activeIndex];
  }

  swap() {
    if (this.swapCooldown > 0) return false;
    this.activeIndex = (this.activeIndex + 1) % this.heroes.length;
    this.swapCooldown = this.swapCooldownDuration;
    this.heroes[this.activeIndex].resetCooldowns();
    return true;
  }

  updateSwapCooldown(delta: number) {
    this.swapCooldown = Math.max(0, this.swapCooldown - delta);
  }

  layoutHeroes() {
    const center = this.activeHero.position;
    const followers = this.heroes.filter((_, i) => i !== this.activeIndex);
    const offsets = [
      { x: -Tuning.hero.followerOffset, y: Tuning.hero.followerOffset },
      { x: Tuning.hero.followerOffset, y: Tuning.hero.followerOffset },
    ];
    for (let i = 0; i < followers.length; i++) {
      const hero = followers[i];
      const off = offsets[i];
      hero.position.x = center.x + off.x;
      hero.position.y = center.y + off.y;
    }
  }

  getPartyCenter() {
    const sum = this.heroes.reduce(
      (acc, h) => {
        acc.x += h.position.x;
        acc.y += h.position.y;
        return acc;
      },
      { x: 0, y: 0 }
    );
    return { x: sum.x / this.heroes.length, y: sum.y / this.heroes.length };
  }
}
