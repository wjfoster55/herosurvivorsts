import { Application, Container } from 'pixi.js';

export class Renderer {
  app: Application;
  backgroundLayer: Container;
  entityLayer: Container;
  uiLayer: Container;

  constructor() {
    this.app = new Application();
    this.backgroundLayer = new Container();
    this.entityLayer = new Container();
    this.uiLayer = new Container();
  }

  async init() {
    await this.app.init({
      resizeTo: window,
      background: '#0a0a0f',
      antialias: true,
    });
    document.body.style.margin = '0';
    document.body.appendChild(this.app.canvas);

    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.entityLayer);
    this.app.stage.addChild(this.uiLayer);
  }

  clearLayers() {
    this.backgroundLayer.removeChildren();
    this.entityLayer.removeChildren();
    this.uiLayer.removeChildren();
  }
}
