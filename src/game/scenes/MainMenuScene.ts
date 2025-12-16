import { Container, Graphics, Text } from 'pixi.js';
import { Game } from '../Game';
import { Scene } from '../SceneManager';
import { POWERS_IN_ORDER, PowersetId } from '../powers/PowersetId';
import { POWERS } from '../powers/PowersetRegistry';
import { BackgroundRenderer } from '../render/BackgroundRenderer';
import { RunScene } from './RunScene';

export class MainMenuScene implements Scene {
  private game: Game;
  private container = new Container();
  private selectionIndex = 0;
  private background = new BackgroundRenderer();
  private selectionText!: Text;

  constructor(game: Game) {
    this.game = game;
  }

  enter(): void {
    this.game.renderer.clearLayers();
    this.game.renderer.backgroundLayer.addChild(this.background.container);
    this.buildUi();
  }

  exit(): void {
    this.container.removeFromParent();
    this.background.container.removeFromParent();
  }

  private buildUi() {
    const { uiLayer } = this.game.renderer;
    this.container.removeChildren();
    uiLayer.addChild(this.container);

    const title = new Text({
      text: 'HeroSurvivors',
      style: {
        fill: '#f5f6fa',
        fontSize: 64,
        fontWeight: '800',
        letterSpacing: 2,
      },
    });
    title.position.set(80, 80);
    this.container.addChild(title);

    const subtitle = new Text({
      text: 'NYC rooftops, three heroes, endless swarm.',
      style: { fill: '#9ca3af', fontSize: 20 },
    });
    subtitle.position.set(80, 150);
    this.container.addChild(subtitle);

    this.selectionText = new Text({
      text: '',
      style: { fill: '#f1c40f', fontSize: 26, fontWeight: '700' },
    });
    this.selectionText.position.set(80, 220);
    this.container.addChild(this.selectionText);

    const startHint = new Text({
      text: 'Left/Right: choose powerset  •  Enter: New Run  •  Space/Shift: swap hero in run',
      style: { fill: '#bdc3c7', fontSize: 16 },
      resolution: 2,
    });
    startHint.position.set(80, 280);
    this.container.addChild(startHint);

    const blocks = new Graphics();
    blocks.rect(70, 340, 640, 3).fill(0x1c1c2b);
    blocks.rect(70, 360, 540, 3).fill(0x1c1c2b);
    uiLayer.addChild(blocks);

    this.updateSelectionText();
  }

  private updateSelectionText() {
    const power = POWERS_IN_ORDER[this.selectionIndex % POWERS_IN_ORDER.length];
    this.selectionText.text = `Starter Powerset: ${POWERS[power as PowersetId].name}`;
  }

  private cycle(offset: number) {
    this.selectionIndex = (this.selectionIndex + offset + POWERS_IN_ORDER.length) % POWERS_IN_ORDER.length;
    this.updateSelectionText();
  }

  update(_deltaMs: number): void {
    const input = this.game.input;
    if (input.wasPressed('arrowleft') || input.wasPressed('a')) {
      this.cycle(-1);
    }
    if (input.wasPressed('arrowright') || input.wasPressed('d')) {
      this.cycle(1);
    }
    if (input.wasPressed('enter')) {
      const selected = POWERS_IN_ORDER[this.selectionIndex] as PowersetId;
      this.game.sceneManager.setScene(new RunScene(this.game, selected));
    }
    this.background.update(0, 0);
  }
}
