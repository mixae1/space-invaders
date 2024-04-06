import gameObject from "./game-object";

export default class Alien extends gameObject{
  constructor(x, y, [spriteA, spriteB], alienType, canShoot, nextShooter) {
    super()
    this.x = x;
  	this.y = y;
    this._spriteA = spriteA;
    this._spriteB = spriteB;
    this.r = spriteA.w / 2;
    this.alienType = alienType;
    this.canShoot = canShoot;
    this.nextShooter = nextShooter;
    this.prevShooter = null;
    this.lastShoot = 0;
    switch (alienType) {
      case 0:
        this.shootDelay = 1500;
        break;
      case 1:
        this.shootDelay = 2000;
        break;
      case 2:
        this.shootDelay = 3000;
        break;
      default:
        break;
    }
  }

  draw(ctx, time) {
    let sp = (Math.ceil(time / 1000) % 2 === 0) ? this._spriteA : this._spriteB;

    ctx.drawImage(
      sp.img,
      sp.x, sp.y, sp.w, sp.h,
      this.x, this.y, sp.w, sp.h
    )
  }
}
