import gameObject from "./game-object";

export default class Alien extends gameObject{
  constructor(x, y, [spriteA, spriteB]) {
    super()
    this.x = x;
  	this.y = y;
    this._spriteA = spriteA;
    this._spriteB = spriteB;
    this.r = spriteA.w / 2;
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
