import { Input } from '../input/Input';
import { Party } from '../party/Party';
import { Tuning } from '../tuning';

export class PartyController {
  updateMovement(party: Party, input: Input, delta: number) {
    const hero = party.activeHero;
    let ax = 0;
    let ay = 0;
    if (input.isDown('w') || input.isDown('arrowup')) ay -= 1;
    if (input.isDown('s') || input.isDown('arrowdown')) ay += 1;
    if (input.isDown('a') || input.isDown('arrowleft')) ax -= 1;
    if (input.isDown('d') || input.isDown('arrowright')) ax += 1;

    const len = Math.hypot(ax, ay);
    if (len > 0) {
      ax /= len;
      ay /= len;
      hero.velocity.x += ax * Tuning.hero.acceleration * delta;
      hero.velocity.y += ay * Tuning.hero.acceleration * delta;
    } else {
      hero.velocity.x *= Math.max(0, 1 - Tuning.hero.friction * delta);
      hero.velocity.y *= Math.max(0, 1 - Tuning.hero.friction * delta);
    }

    const speed = Math.hypot(hero.velocity.x, hero.velocity.y);
    const maxSpeed = Tuning.hero.maxSpeed;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      hero.velocity.x *= scale;
      hero.velocity.y *= scale;
    }

    hero.position.x += hero.velocity.x * delta;
    hero.position.y += hero.velocity.y * delta;
  }

  tickState(party: Party, delta: number) {
    const hero = party.activeHero;
    hero.invisibleTimer = Math.max(0, hero.invisibleTimer - delta);
    hero.aggroDropTimer = Math.max(0, hero.aggroDropTimer - delta);
    party.updateSwapCooldown(delta);
  }

  trySwap(party: Party, input: Input) {
    if (input.wasPressed(' ') || input.wasPressed('space') || input.wasPressed('shift')) {
      return party.swap();
    }
    return false;
  }
}
