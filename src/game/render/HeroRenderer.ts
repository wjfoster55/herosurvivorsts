import { Container, Graphics } from 'pixi.js';
import { HeroSpriteParts } from '../party/SpriteParts';

export class HeroRenderer {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  createHeroSprite(parts: HeroSpriteParts): Graphics {
    const g = new Graphics();
    // Legs
    g.roundRect(-10, 8, 20, 18, 6).fill(parts.legColor);
    // Torso
    g.roundRect(-12, -6, 24, 16, 6).fill(parts.torsoColor);
    g.roundRect(-14, -2, 28, 10, 5).stroke({ color: parts.accentColor, width: 2 });
    // Head
    g.circle(0, -16, 8).fill(parts.headColor);
    // Eyes/accent
    g.rect(-4, -18, 2, 2).fill(0xffffff);
    g.rect(2, -18, 2, 2).fill(0xffffff);
    return g;
  }

  positionSprite(sprite: Graphics, x: number, y: number, rotation = 0) {
    sprite.position.set(x, y);
    sprite.rotation = rotation;
  }
}
