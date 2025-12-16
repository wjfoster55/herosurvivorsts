import { Renderer } from './render/Renderer';
import { SceneManager } from './SceneManager';
import { Input } from './input/Input';
import { MainMenuScene } from './scenes/MainMenuScene';

export class Game {
  renderer: Renderer;
  sceneManager: SceneManager;
  input: Input;

  constructor() {
    this.renderer = new Renderer();
    this.sceneManager = new SceneManager();
    this.input = new Input();
  }

  async start() {
    await this.renderer.init();
    this.sceneManager.setScene(new MainMenuScene(this));
    this.renderer.app.ticker.add((ticker) => {
      this.sceneManager.update(ticker.deltaMS);
      this.input.endFrame();
    });
  }
}
