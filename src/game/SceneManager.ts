export interface Scene {
  enter(): void;
  exit(): void;
  update(deltaMs: number): void;
}

export class SceneManager {
  private current: Scene | null = null;

  setScene(scene: Scene) {
    if (this.current) {
      this.current.exit();
    }
    this.current = scene;
    this.current.enter();
  }

  update(deltaMs: number) {
    if (this.current) {
      this.current.update(deltaMs);
    }
  }
}
