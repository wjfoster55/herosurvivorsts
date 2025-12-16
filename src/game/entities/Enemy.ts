export interface Enemy {
  x: number;
  y: number;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  slowTimer: number;
  slowAmount: number;
  stunTimer: number;
  burnTimer: number;
  burnDamage: number;
}

export function createEnemy(x: number, y: number): Enemy {
  return {
    x,
    y,
    hp: 40,
    speed: 60,
    damage: 6,
    radius: 14,
    slowTimer: 0,
    slowAmount: 0.5,
    stunTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
  };
}
