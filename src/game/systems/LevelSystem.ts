import { LevelUpSkill } from '../powers/Skills';

export class LevelSystem {
  level = 1;
  xp = 0;
  xpToNext = 50;
  pendingChoices: LevelUpSkill[] = [];
  pausedForChoice = false;

  addXp(amount: number, skillsPool: LevelUpSkill[]) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.floor(this.xpToNext * 1.2 + 20);
      this.offerChoices(skillsPool);
    }
  }

  private offerChoices(skillsPool: LevelUpSkill[]) {
    this.pendingChoices = [];
    const pool = [...skillsPool];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      this.pendingChoices.push(pool[idx]);
      pool.splice(idx, 1);
    }
    this.pausedForChoice = true;
  }

  selectChoice(index: number) {
    const chosen = this.pendingChoices[index];
    this.pendingChoices = [];
    this.pausedForChoice = false;
    return chosen;
  }
}
