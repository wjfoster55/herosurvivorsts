import { Container, Graphics } from 'pixi.js';

export class BackgroundRenderer {
  container: Container;
  private spacing = 80;
  private size = 2400;

  constructor() {
    this.container = new Container();
    const grid = new Graphics();
    grid.stroke({ color: 0x1c1c2b, width: 2, alpha: 0.7 });
    for (let x = -this.size; x <= this.size; x += this.spacing) {
      grid.moveTo(x, -this.size);
      grid.lineTo(x, this.size);
    }
    for (let y = -this.size; y <= this.size; y += this.spacing) {
      grid.moveTo(-this.size, y);
      grid.lineTo(this.size, y);
    }
    this.container.addChild(grid);
  }

  update(cameraX: number, cameraY: number) {
    this.container.position.set(-(cameraX % this.spacing), -(cameraY % this.spacing));
  }
}
