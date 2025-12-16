export interface Pickup {
  x: number;
  y: number;
  radius: number;
  value: number;
}

export function createPickup(x: number, y: number, value: number): Pickup {
  return { x, y, radius: 10, value };
}
