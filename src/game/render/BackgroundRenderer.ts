import { Container, Graphics } from 'pixi.js';

export class BackgroundRenderer {
  container: Container;
  private spacing = 96;
  private size = 2400;

  constructor() {
    this.container = new Container();
    const grid = new Graphics();
    grid.stroke({ color: 0x294057, width: 2, alpha: 0.5 });
    const dots = new Graphics();
    dots.fill({ color: 0x3c5a75, alpha: 0.7 });

    for (let x = -this.size; x <= this.size; x += this.spacing) {
      grid.moveTo(x, -this.size);
      grid.lineTo(x, this.size);
    }
    for (let y = -this.size; y <= this.size; y += this.spacing) {
      grid.moveTo(-this.size, y);
      grid.lineTo(this.size, y);
    }
    const dotSpacing = this.spacing / 2;
    for (let x = -this.size; x <= this.size; x += dotSpacing) {
      for (let y = -this.size; y <= this.size; y += dotSpacing) {
        const jitterX = ((x + y) % this.spacing) * 0.05;
        const jitterY = ((y - x) % this.spacing) * 0.05;
        dots.circle(x + jitterX, y + jitterY, 2);
      }
    }

    this.container.addChild(grid);
    this.container.addChild(dots);
  }

  update(cameraX: number, cameraY: number) {
    this.container.position.set(-(cameraX % this.spacing), -(cameraY % this.spacing));
  }
}
