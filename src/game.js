import Sprite from './sprite'
import Cannon from './cannon'
import Bullet from './bullet'
import Alien from './alien'
import InputHandler from './input-handler'

import assetPath from '../assets/invaders.png'

let assets;
const sprites = {
  aliens: [],
  cannon: null,
  bunker: null
};
const gameState = {
  bullets: [],
  aliens: [],
  aliens_dx: 3,
  aliens_left: 0,
  aliens_right: 11 * 40,
  cannon: null,
  canvas: null,
  cannon_dx: 0,
  superMode: null,

  PAUSE: false,
  ENDGAME: 0, // -1 LOSE, 0 nothing, 1 WIN 
};
const inputHandler = new InputHandler();

export function preload(onPreloadComplete) {
  assets = new Image();
	assets.addEventListener("load", () => {
    sprites.cannon = new Sprite(assets, 62, 0, 22, 16);
    sprites.bunker = new Sprite(assets, 84, 8, 36, 24);
    sprites.aliens = [
      [new Sprite(assets,  0, 0, 22, 16), new Sprite(assets,  0, 16, 22, 16)],
			[new Sprite(assets, 22, 0, 16, 16), new Sprite(assets, 22, 16, 16, 16)],
			[new Sprite(assets, 38, 0, 24, 16), new Sprite(assets, 38, 16, 24, 16)]
    ]

    onPreloadComplete();
  });
	assets.src = assetPath;
}

export function init(canvas) {
  const alienTypes = [1, 0, 1, 2, 0, 2];
	for (var i = 0, len = alienTypes.length; i < len; i++) {
		for (var j = 0; j < 10; j++) {
      const alienType = alienTypes[i];

      let alienX = 40 + j*40;
      let alienY = 40 + i*40;

      if (alienType === 1) {
        alienX += 3; // (kostyl) aliens of this type is a bit thinner
      }

			gameState.aliens.push(
        new Alien(alienX, 
            alienY, 
            sprites.aliens[alienType], 
            alienType, 
            i + 1 == len ? true : false,
            i > 0 ? gameState.aliens[j + (i-1)*10] : null)
			);

      gameState.canvas = canvas
		}
	}

  for(var i = 0; i < gameState.aliens.length; i++){
    if(i + 10 < gameState.aliens.length){
      gameState.aliens[i].prevShooter = gameState.aliens[i + 10]
    }
  }

  gameState.cannon = new Cannon(
    100, canvas.height - 100,
    sprites.cannon
  );
}
function restart(){
  gameState.bullets = []
  gameState.aliens = []
  gameState.cannon = null
  gameState.superMode = null
  gameState.PAUSE = false
  gameState.ENDGAME = 0

  init(gameState.canvas)
}

export function update(time, stopGame) {

  /**
   * UI input
   */
  if (gameState.ENDGAME == 0 && inputHandler.isPressed('Escape')){
    gameState.PAUSE = gameState.PAUSE ? false : true
  }

  if (gameState.ENDGAME != 0 && inputHandler.isPressed('Enter')){
    restart()
    return
  }

  if(gameState.PAUSE) return;
  /**
   * UPDATE SUPER MODE
   */
  if(gameState.superMode && gameState.superMode < performance.now()){
    gameState.superMode = null
  }

  /**
   * User input
   */
	if (inputHandler.isDown('ArrowLeft')) {
    gameState.cannon_dx = -4
	} else if (inputHandler.isDown('ArrowRight')) {
		gameState.cannon_dx = 4
	} else {
    gameState.cannon_dx = 0
  }

  gameState.cannon.x += gameState.cannon_dx;
  if(gameState.cannon.x < 0) gameState.cannon.x = 0
  if(gameState.cannon.x + gameState.cannon.width > gameState.canvas.width) gameState.cannon.x = gameState.canvas.width - gameState.cannon.width

  /**
   * User attack
   */
  if (inputHandler.isPressed('Space')) {
    const bulletX = gameState.cannon.x + 10;
    const bulletY = gameState.cannon.y;
		gameState.bullets.push(new Bullet(bulletX, bulletY, 0, -8, 2, 6, "#fff"));
	}

  /**
   * Aliens-bullet collisions
   */
  gameState.aliens.forEach((a, j) => {
    gameState.bullets.find((b, i) => {
      if(a.contains(b)) {
        if(a.nextShooter) a.nextShooter.canShoot = a.canShoot
        else {
          /**
           * SUPER MODE ACTIVATING
           */
          if(!gameState.superMode){
            gameState.superMode = performance.now()
          }
          gameState.superMode += 600
        }

        if(a.prevShooter && a.nextShooter){
          a.prevShooter.nextShooter = a.nextShooter
          a.nextShooter.prevShooter = a.prevShooter
        }
        gameState.aliens.splice(j, 1)
        gameState.bullets.splice(i, 1)
        if(gameState.aliens.length == 0){
          gameState.PAUSE = true
          gameState.ENDGAME = 1
        }
        return true
      }
      return false
    })
  });

  /**
     * Cannon-bullet collisions
     */
  gameState.bullets.find((b, i) => {
    if(gameState.cannon.contains(b)) {
      gameState.cannon.lives--
      
      gameState.bullets.splice(i, 1)
      if(gameState.cannon.lives <= 0){
        gameState.PAUSE = true
        gameState.ENDGAME = -1
      }
      return true
    }
    return false
  })

  /**
   * Aliens movement
   */
  let delta = 0;
  if(gameState.aliens_left < 0) {
    delta = -gameState.aliens_left;
    gameState.aliens_right += delta;
    gameState.aliens_left += delta;
    gameState.aliens_dx = Math.abs(gameState.aliens_dx);
  }
  else if(gameState.aliens_right > gameState.canvas.width) {
    delta = gameState.canvas.width - gameState.aliens_right;
    gameState.aliens_right += delta;
    gameState.aliens_left += delta;
    gameState.aliens_dx = -Math.abs(gameState.aliens_dx);
  }
  else {
    if(Math.random() > 0.98) gameState.aliens_dx *= -1;
    gameState.aliens_right += gameState.aliens_dx;
    gameState.aliens_left += gameState.aliens_dx;
    delta += gameState.aliens_dx
  }

  gameState.aliens.forEach(a => a.x += delta);

  /**
   * Aliens shooting
   */
  gameState.aliens.forEach(a => {
    if(a.canShoot && (gameState.superMode != null || a.lastShoot + a.shootDelay < performance.now()) && gameState.aliens.every(a2 => {
      return a == a2 || !a2.intersects(a, gameState.cannon)
    })){
      a.lastShoot = performance.now()
      const vec = {x: gameState.cannon.x - a.x, y: gameState.cannon.y - a.y}
      const magn = Math.abs(vec.x + vec.y)
      vec.x /= magn
      vec.y /= magn
      switch (a.alienType) {
        case 0:
          gameState.bullets.push(new Bullet(a.x, a.y + a.r + 10, vec.x * 8, vec.y * 8, 2, 6, "#fff"))
          break;
        case 1:
          gameState.bullets.push(new Bullet(a.x, a.y + a.r + 10, vec.x * 4, vec.y * 4, 4, 4, "#aff"))
          break;
        case 2:
          gameState.bullets.push(new Bullet(a.x, a.y + a.r + 10, vec.x * 2, vec.y * 2, 6, 6, "#faf"))
          break;
        default:
          break;
      }
    }
  });

  /**
   * Bullet deleting
   */
  gameState.bullets.forEach((b, i) => {
    if(b.x < 0 || b.y < 0 || b.x > gameState.canvas.width || b.y > gameState.canvas.height) gameState.bullets.splice(i, 1)
    else b.update(time)
  });
}

export function draw(canvas, time) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameState.aliens.forEach(a => a.draw(ctx, time));
  gameState.cannon.draw(ctx);
  gameState.bullets.forEach(b => b.draw(ctx));

  if (gameState.ENDGAME != 0) {
    ctx.textAlign = "center";
    ctx.font = "25px serif";
    ctx.fillStyle = "#FFffFF";
    ctx.fillText(gameState.ENDGAME == 1 ? 
      "YOU WIN" : 
      "YOU DIED", 
      gameState.canvas.width / 2, 
      gameState.canvas.height / 2);
    ctx.font = "15px serif";
    ctx.fillText("press <ENTER> to restart", 
      gameState.canvas.width / 2, 
      gameState.canvas.height / 2 + 25)   
  }else if(gameState.PAUSE){
    ctx.textAlign = "center";
    ctx.font = "25px serif";
    ctx.fillStyle = "#FFffFF";
    ctx.fillText(
      "PAUSED",
      gameState.canvas.width / 2, 
      gameState.canvas.height / 2);
    ctx.font = "15px serif";
  }

  ctx.fillStyle = "#FFffFF";
  ctx.textAlign = "left";
  ctx.font = "20px serif";
  ctx.fillText("Lives: " + Math.max(gameState.cannon.lives, 0), 0, 20)
}
