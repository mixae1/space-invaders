import gameObject from "./game-object";

export default class Cannon extends gameObject {
  constructor(x, y, sprite) {
    super()
    this.x = x;
  	this.y = y;
    this.r = sprite.w / 2;
    this._sprite = sprite;
    this.lives = 3;
  }

  get width(){
    return this._sprite.w
  }

  draw(ctx, time) {
    ctx.drawImage(
      this._sprite.img,
      this._sprite.x, this._sprite.y, this._sprite.w, this._sprite.h,
      this.x, this.y, this._sprite.w, this._sprite.h
    );
  }
}
