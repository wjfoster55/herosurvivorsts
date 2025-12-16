import { PowersetId } from '../powers/PowersetId';

export enum ProjectileKind {
  Basic = 'basic',
  Piercing = 'piercing',
  Boomerang = 'boomerang',
  Shot = 'shot',
  Orbit = 'orbit',
}

export interface ProjectileEffect {
  slowAmount?: number;
  slowDuration?: number;
  burnDamage?: number;
  burnDuration?: number;
  chainCount?: number;
  chainRadius?: number;
  chainDamage?: number;
  critChance?: number;
  critMultiplier?: number;
}

export interface Projectile {
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  lifetime: number;
  pierce: number;
  fromHero: number;
  source: PowersetId;
  maxTravel?: number;
  traveled?: number;
  returning?: boolean;
  originX?: number;
  originY?: number;
  angle?: number;
  effect?: ProjectileEffect;
}
