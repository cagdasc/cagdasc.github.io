import { Particle } from './types';

export class ParticlePool {
  private particles: Particle[];
  private maxSize: number;
  private nextIndex: number = 0;

  constructor(maxSize: number = 400) {
    this.maxSize = maxSize;
    this.particles = new Array(maxSize);
    for (let i = 0; i < maxSize; i++) {
      this.particles[i] = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 2,
        startSize: 2,
        color: '#ff8800',
        alpha: 1
      };
    }
  }

  public emit(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    color: string
  ): void {
    const p = this.particles[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % this.maxSize;

    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.maxLife = life;
    p.size = size;
    p.startSize = size;
    p.color = color;
    p.alpha = 1;
  }

  public update(dt: number): void {
    for (let i = 0; i < this.maxSize; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction / slow down
      p.vx *= (1 - 0.5 * dt);
      p.vy *= (1 - 0.5 * dt);

      const progress = p.life / p.maxLife; // 1 -> 0
      p.alpha = Math.max(0, progress);
      p.size = p.startSize * (0.3 + 0.7 * progress);
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    ctx.save();
    for (let i = 0; i < this.maxSize; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const screenX = p.x - cameraX;
      if (screenX < -50 || screenX > 2500) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screenX, p.y, Math.max(0.75, p.size), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public reset(): void {
    for (let i = 0; i < this.maxSize; i++) {
      this.particles[i].active = false;
    }
    this.nextIndex = 0;
  }
}
