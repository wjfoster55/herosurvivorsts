export class Input {
  private pressed = new Set<string>();
  private held = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!this.held.has(key)) {
      this.pressed.add(key);
    }
    this.held.add(key);
  }

  private onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.held.delete(key);
  }

  isDown(key: string) {
    return this.held.has(key.toLowerCase());
  }

  wasPressed(key: string) {
    return this.pressed.has(key.toLowerCase());
  }

  endFrame() {
    this.pressed.clear();
  }
}
