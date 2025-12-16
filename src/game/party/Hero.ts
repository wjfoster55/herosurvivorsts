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

export interface HeroPowerState {
  slowChance: number;
  slowAmount: number;
  slowDuration: number;
  chainCount: number;
  chainRadius: number;
  critChance: number;
  critMultiplier: number;
  burnDamage: number;
  burnDuration: number;
  burnExplosion: number;
  projectileScale: number;
  backstabBonus: number;
}

function defaultPowerState(powerset: PowersetId): HeroPowerState {
  switch (powerset) {
    case PowersetId.Web:
      return {
        slowChance: 0.65,
        slowAmount: 0.4,
        slowDuration: 2.2,
        chainCount: 0,
        chainRadius: 0,
        critChance: 0,
        critMultiplier: 1.5,
        burnDamage: 0,
        burnDuration: 0,
        burnExplosion: 0,
        projectileScale: 1,
        backstabBonus: 0,
      };
    case PowersetId.Shock:
      return {
        slowChance: 0,
        slowAmount: 1,
        slowDuration: 0,
        chainCount: 2,
        chainRadius: 120,
        critChance: 0,
        critMultiplier: 1.6,
        burnDamage: 0,
        burnDuration: 0,
        burnExplosion: 0,
        projectileScale: 1,
        backstabBonus: 0,
      };
    case PowersetId.Shadow:
      return {
        slowChance: 0,
        slowAmount: 1,
        slowDuration: 0,
        chainCount: 0,
        chainRadius: 0,
        critChance: 0.18,
        critMultiplier: 1.9,
        burnDamage: 0,
        burnDuration: 0,
        burnExplosion: 0,
        projectileScale: 1,
        backstabBonus: 0.35,
      };
    case PowersetId.Fire:
    default:
      return {
        slowChance: 0,
        slowAmount: 1,
        slowDuration: 0,
        chainCount: 0,
        chainRadius: 0,
        critChance: 0,
        critMultiplier: 1.6,
        burnDamage: 2.2,
        burnDuration: 2.4,
        burnExplosion: 6,
        projectileScale: 1.2,
        backstabBonus: 0,
      };
  }
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
  velocity = { x: 0, y: 0 };
  power: HeroPowerState;
  invisibleTimer = 0;
  aggroDropTimer = 0;

  constructor(name: string, powerset: PowersetId, stats: HeroStats) {
    this.name = name;
    this.powerset = powerset;
    this.stats = stats;
    this.currentHp = stats.maxHp;
    this.parts = randomParts();
    this.power = defaultPowerState(powerset);
  }

  resetCooldowns() {
    this.attackTimer = 0;
    this.followerTimer = 0;
    this.swapCooldown = 0;
  }
}
