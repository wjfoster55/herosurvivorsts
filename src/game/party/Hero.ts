import { PowersetId } from '../powers/PowersetId';
import { HeroSpriteParts, randomParts } from './SpriteParts';

export interface HeroStats {
  maxHp: number;
  damage: number;
  attackRate: number;
  followerRate: number;
  range: number;
  moveSpeed: number;
}

export class Hero {
  readonly name: string;
  readonly powerset: PowersetId;
  readonly parts: HeroSpriteParts;
  stats: HeroStats;
  currentHp: number;
  attackTimer = 0;
  followerTimer = 0;
  swapCooldown = 0;
  position = { x: 0, y: 0 };

  constructor(name: string, powerset: PowersetId, stats: HeroStats) {
    this.name = name;
    this.powerset = powerset;
    this.stats = stats;
    this.currentHp = stats.maxHp;
    this.parts = randomParts();
  }

  resetCooldowns() {
    this.attackTimer = 0;
    this.followerTimer = 0;
    this.swapCooldown = 0;
  }
}
