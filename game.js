"use strict";
const TILEWIDTH = 64;
function placeCharacters(gamestate) {
  if (gamestate.levelNames[gamestate.levelCounter] != gamestate.currLevel) {
    gamestate.currLevel = gamestate.levelNames[gamestate.levelCounter]
  }
  gamestate.tick = -1;
  for (let row = 0; row < gamestate.levels[gamestate.currLevel].length; ++row) {
    for (let col = 0; col < gamestate.levels[gamestate.currLevel][0].length; ++col) {
      if (gamestate.levels[gamestate.currLevel][row][col] === "s") {
        for (let i = 0; i < gamestate.histories.length; ++i) {
          gamestate.histories[i].x = col * TILEWIDTH;
          gamestate.histories[i].y = row * TILEWIDTH;
          gamestate.histories[i].gravity = "down";
          gamestate.histories[i].previous = {};
          gamestate.histories[i].fizzle = false;
          gamestate.histories[i].dx = 0;
          gamestate.histories[i].dy = 0;
          gamestate.histories[i].rotation = 0;
          gamestate.histories[i].desiredrotation = 0;
        }
        gamestate.char.x = col * TILEWIDTH;
        gamestate.char.y = row * TILEWIDTH;
        gamestate.char.gravity = "down";
        gamestate.char.history = [];
        gamestate.char.previous = {};
        gamestate.char.dx = 0;
        gamestate.char.dy = 0;
        gamestate.char.rotation = 0;
        gamestate.char.desiredrotation = 0;
      }
    }
  }
}
function Character() {
  const char = {};
  char.x = 0
  char.y = 0
  char.dx = 0
  char.dy = 0
  char.width = 48
  char.gravity = "down";
  char.history = [];
  char.previous = {};
  char.current = true;
  char.fizzle = false;
  char.rotation = 0;
  char.desiredrotation = 0;
  const touching = (x, y, gamestate) => {
    const tl = gamestate.levels[gamestate.currLevel][Math.floor(y / TILEWIDTH)][Math.floor(x / TILEWIDTH)]
    const tr = gamestate.levels[gamestate.currLevel][Math.floor(y / TILEWIDTH)][Math.floor((x + char.width) / TILEWIDTH)]
    const bl = gamestate.levels[gamestate.currLevel][Math.floor((y + char.width) / TILEWIDTH)][Math.floor((x + char.width) / TILEWIDTH)]
    const br = gamestate.levels[gamestate.currLevel][Math.floor((y + char.width) / TILEWIDTH)][Math.floor(x / TILEWIDTH)]
    return [tl, tr, bl, br];
  }
  const collides = (x, y, gamestate) => {
    return touching(x, y, gamestate).includes("b") || touching(x, y, gamestate).includes("o");
  }
  char.flip = (ctx) => {
    switch (char.gravity) {
      case "down": {
        if (char.dx < 0) {
          ctx.scale(-1, 1);
          return true;
        }
        break;
      }
      case "up": {
        if (char.dx > 0) {
          ctx.scale(-1, 1);
          return true;
        }
        break;
      }
      case "left": {
        if (char.dy < 0) {
          ctx.scale(1, -1);
          return true;
        }
        break;
      }
      case "right": {
        if (char.dy > 0) {
          ctx.scale(1, -1);
          return true;
        }
        break;
      }
    }
    return false;
  }
  char.collidingButton = (x, y, gamestate) => {
    if (char.fizzle){
      return false;
    }
    const t = touching(char.x, char.y, gamestate).includes(gamestate.levels[gamestate.currLevel][y][x]);
    if (!t) {
      return false;
    }
    if (gamestate.levels[gamestate.currLevel][y][x].dir == "q" && char.gravity == "down") {
      return true;
    }
    if (gamestate.levels[gamestate.currLevel][y][x].dir == "w" && char.gravity == "up") {
      return true;
    }
    if (gamestate.levels[gamestate.currLevel][y][x].dir == "e" && char.gravity == "right") {
      return true;
    }
    if (gamestate.levels[gamestate.currLevel][y][x].dir == "t" && char.gravity == "left") {
      return true;
    }
    return false;
  }
  char.update = (gamestate, input) => {
    if (char.fizzle) {
      return;
    }
    if (char.current) {
      const changes = {};
      for (let key of Object.keys(input)) {
        if (input[key] !== char.previous[key]) {
          changes[key] = input[key];
          char.previous[key] = input[key];
        }
      }
      char.history.push(changes);
    } else {
      for (let key of Object.keys(char.history[gamestate.tick])) {
        char.previous[key] = char.history[gamestate.tick][key];
      }
      input = char.previous;
    }
    char.rotation = Math.atan2(Math.random() * .1 - .05 + Math.sin(char.rotation) * 10 + Math.sin(char.desiredrotation), Math.random() * .1 - .05 + Math.cos(char.rotation) * 10 + Math.cos(char.desiredrotation))
    const FRICTION = .94;
    const AIRFRICTION = .99;
    const GRAVITY = .4;
    const GROUNDACCEL = .35;
    const AIRACCEL = .2;
    const JUMPPOWER = 12;
    const cx = collides(char.x + char.dx, char.y, gamestate);
    const sx = Math.sign(char.dx);
    const sy = Math.sign(char.dy);
    if (!cx) {
      char.x += char.dx;
    }
    const cy = collides(char.x, char.y + char.dy, gamestate);
    if (!cy) {
      char.y += char.dy;
    }
    if (cx) {
      char.dx = 0;
      if (["left", "right"].includes(char.gravity)) {
        char.dy *= FRICTION;
      }
    }
    if (cy) {
      char.dy = 0;
      if (["up", "down"].includes(char.gravity)) {
        char.dx *= FRICTION;
      }
    }
    let accel = AIRACCEL;
    if (cx || cy) {
      accel = GROUNDACCEL;
    }
    char.dx *= AIRFRICTION
    char.dy *= AIRFRICTION
    switch (char.gravity) {
      case "down": {
        char.dy += GRAVITY;
        break;
      }
      case "up": {
        char.dy -= GRAVITY;
        break;
      }
      case "left": {
        char.dx -= GRAVITY;
        break;
      }
      case "right": {
        char.dx += GRAVITY;
        break;
      }
    }
    if (input.left && ["up", "down"].includes(char.gravity)) {
      char.dx -= accel;
    }
    if (input.right && ["up", "down"].includes(char.gravity)) {
      char.dx += accel;
    }
    if (input.up && ["left", "right"].includes(char.gravity)) {
      char.dy -= accel;
    }
    if (input.down && ["left", "right"].includes(char.gravity)) {
      char.dy += accel;
    }
    if (touching(char.x, char.y, gamestate).includes("g")) {
      if (input.gravityLeft) {
        char.gravity = "left";
        char.desiredrotation = 90 * Math.PI / 180
      }
      if (input.gravityRight) {
        char.gravity = "right";
        char.desiredrotation = -90 * Math.PI / 180
      }
      if (input.gravityUp) {
        char.gravity = "up";
        char.desiredrotation = 180 * Math.PI / 180
      }
      if (input.gravityDown) {
        char.gravity = "down";
        char.desiredrotation = 0 * Math.PI / 180
      }
    }
    if (input.jump) {
      if (char.gravity == "down" && cy && sy == 1) {
        char.dy = -JUMPPOWER;
      }
      if (char.gravity == "left" && cx && sx == -1) {
        char.dx = JUMPPOWER;
      }
      if (char.gravity == "up" && cy && sy == -1) {
        char.dy = JUMPPOWER;
      }
      if (char.gravity == "right" && cx && sx == 1) {
        char.dx = -JUMPPOWER;
      }
    }
    if (touching(char.x, char.y, gamestate).includes("u") && char.gravity=="down") {
      nextLevel(gamestate);
    }
    if (touching(char.x, char.y, gamestate).includes("d") && char.gravity=="up") {
      nextLevel(gamestate);
    }
    if (touching(char.x, char.y, gamestate).includes("l") && char.gravity=="right") {
      nextLevel(gamestate);
    }
    if (touching(char.x, char.y, gamestate).includes("r") && char.gravity=="left") {
      nextLevel(gamestate);
    }
    if (input.restart || touching(char.x, char.y, gamestate).includes("k")) {
      gamestate.restart = true;
    }
    if (input.beem) {
      if (char.current) {
        if (gamestate.clones[gamestate.currLevel] > gamestate.histories.length) {
          const hist = Character();
          hist.history = char.history;
          hist.current = false;
          gamestate.histories.push(hist);
          placeCharacters(gamestate)
        }
      } else {
        char.fizzle = true;
      }
    }
  }
  return char;
}

function logic(gamestate) {
  if (!(gamestate.levels[gamestate.currLevel])) {
    return; // Level not loaded yet
  }
  gamestate.tick += 1;
  gamestate.input.update();

  for (let row = 0; row < gamestate.levels[gamestate.currLevel].length; ++row) {
    for (let col = 0; col < gamestate.levels[gamestate.currLevel][0].length; ++col) {
      if (gamestate.levels[gamestate.currLevel][row][col].id === "button") {
        let touching = gamestate.char.collidingButton(col, row, gamestate);
        for (let i = 0; i < gamestate.histories.length; ++i) {
          if (gamestate.histories[i].collidingButton(col, row, gamestate)) {
            touching = true;
            break;
          }
        }
        if (gamestate.levels[gamestate.currLevel][row][col].active != touching) {
          for (let place of gamestate.levels[gamestate.currLevel][row][col].effect) {
            if (gamestate.levels[gamestate.currLevel][place[1]][place[0]] == "o") {
              gamestate.levels[gamestate.currLevel][place[1]][place[0]] = " "
            }
            else if (gamestate.levels[gamestate.currLevel][place[1]][place[0]] == " ") {
              gamestate.levels[gamestate.currLevel][place[1]][place[0]] = "o"
            }
            else if (gamestate.levels[gamestate.currLevel][place[1]][place[0]] == "g") {
              gamestate.levels[gamestate.currLevel][place[1]][place[0]] = "f"
            }
            else if (gamestate.levels[gamestate.currLevel][place[1]][place[0]] == "f") {
              gamestate.levels[gamestate.currLevel][place[1]][place[0]] = "g"
            }
          }
          gamestate.levels[gamestate.currLevel][row][col].active = touching;
        }
      }
    }
  }

  for (let i = 0; i < gamestate.histories.length; ++i) {
    gamestate.histories[i].update(gamestate);
  }
  gamestate.char.update(gamestate, gamestate.input);
  if (gamestate.restart) {
    gamestate.restart = false;
    gamestate.histories = [];
    placeCharacters(gamestate);
  }
}
function nextLevel(gamestate) {
  gamestate.restart = true;
  gamestate.levelCounter += 1;
}
function draw(gamestate, ctx) {
  ctx.clearRect(0, 0, gamestate.width, gamestate.height);
  ctx.fillRect(0, 0, gamestate.width, gamestate.height)
  if (gamestate.levels[gamestate.currLevel]) {
    ctx.save();
    gamestate.cameraX = gamestate.char.x;
    gamestate.cameraY = gamestate.char.y;
    if (gamestate.cameraX - gamestate.width / 2 < 0) {
      gamestate.cameraX = gamestate.width / 2;
    }
    if (gamestate.cameraY - gamestate.height / 2 < 0) {
      gamestate.cameraY = gamestate.height / 2;
    }
    const ww = TILEWIDTH * (gamestate.levels[gamestate.currLevel][0].length);
    if (gamestate.cameraX + gamestate.width / 2 > ww) {
      gamestate.cameraX = ww - gamestate.width / 2;
    }
    const wh = TILEWIDTH * (gamestate.levels[gamestate.currLevel].length);
    if (gamestate.cameraY + gamestate.height / 2 > wh) {
      gamestate.cameraY = wh - gamestate.height / 2;
    }
    if (gamestate.cameraX - gamestate.width / 2 < 0) {
      gamestate.cameraX = ww / 2;
    }
    if (gamestate.cameraY - gamestate.height / 2 < 0) {
      gamestate.cameraY = wh / 2;
    }
    ctx.translate(-gamestate.cameraX + gamestate.width / 2, -gamestate.cameraY + gamestate.height / 2);

    for (let row = 0; row < gamestate.levels[gamestate.currLevel].length; ++row) {
      for (let col = 0; col < gamestate.levels[gamestate.currLevel][0].length; ++col) {
        if (gamestate.levels[gamestate.currLevel][row][col] == "b") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.drawImage(gamestate.images.block, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col].dir == "q") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(0);
          ctx.drawImage(gamestate.images.button, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col].dir == "w") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(Math.PI);
          ctx.drawImage(gamestate.images.button, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col].dir == "e") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(3 * Math.PI / 2);
          ctx.drawImage(gamestate.images.button, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col].dir == "t") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(gamestate.images.button, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "u") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(0);
          ctx.drawImage(gamestate.images.winbutton, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "d") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(Math.PI);
          ctx.drawImage(gamestate.images.winbutton, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "l") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(3 * Math.PI / 2);
          ctx.drawImage(gamestate.images.winbutton, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "r") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(gamestate.images.winbutton, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "g") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.translate(0, Math.sin((gamestate.tick / 100) * 8));
          ctx.rotate(gamestate.tick / 50);
          ctx.drawImage(gamestate.images.gravityon, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "f") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.translate(0, Math.sin((gamestate.tick / 200) * 8));
          ctx.rotate(gamestate.tick / 100);
          ctx.drawImage(gamestate.images.gravityoff, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "k") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.drawImage(gamestate.images.death, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
        if (gamestate.levels[gamestate.currLevel][row][col] == "o") {
          ctx.save();
          ctx.translate(col * TILEWIDTH + TILEWIDTH / 2, row * TILEWIDTH + TILEWIDTH / 2)
          ctx.drawImage(gamestate.images.door, -TILEWIDTH / 2, -TILEWIDTH / 2, TILEWIDTH, TILEWIDTH);
          ctx.restore();
        }
      }
    }

    for (let i = 0; i < gamestate.histories.length; ++i) {
      const char = gamestate.histories[i];
      if (!char.fizzle) {
        ctx.save();
        ctx.translate(char.x + 24, char.y + 24)
        char.flip(ctx)
        ctx.rotate(char.rotation);
        ctx.translate(0, Math.sin((gamestate.tick + (i * 57 + 13) % 94) / 15) * 2);
        ctx.drawImage(gamestate.images.ghostplayer, -28, -28, 56, 56);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(gamestate.char.x + 24, gamestate.char.y + 24);
    gamestate.char.flip(ctx)
    ctx.rotate(gamestate.char.rotation);
    ctx.translate(0, Math.sin(gamestate.tick / 15) * 2);
    ctx.drawImage(gamestate.images.player, -28, -28, 56, 56);
    ctx.restore();
    ctx.restore();
  }
}
function Input(element) {
  const input = {};
  const keys = new Set();
  const newkeys = new Set();
  element.addEventListener("keydown", (e) => {
    keys.add(e.code);
    newkeys.add(e.code);
    e.preventDefault();
  })
  element.addEventListener("keyup", (e) => {
    keys.delete(e.code);
  })
  input.update = () => {
    input.up = keys.has("KeyW");
    input.left = keys.has("KeyA");
    input.right = keys.has("KeyD");
    input.down = keys.has("KeyS");
    input.gravityUp = keys.has("ArrowUp");
    input.gravityLeft = keys.has("ArrowLeft");
    input.gravityRight = keys.has("ArrowRight");
    input.gravityDown = keys.has("ArrowDown");
    input.jump = keys.has("Space");
    input.beem = newkeys.has("KeyQ");
    input.restart = newkeys.has("KeyR");
    newkeys.clear();
  }
  return input;
}
async function fetchLevel(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split("\n");
  const [clones, height] = rows[0].trim().split(" ");
  const map = []
  for (let i = 1; i < parseInt(height) + 1; ++i) {
    map.push(rows[i].trim().split(""));
  }
  for (let i = parseInt(height) + 1; i < rows.length; ++i) {
    const currRow = rows[i].trim().split(" ");
    const effect = [];
    for (let j = 0; j < (currRow.length - 2) / 2; ++j) {
      effect.push([parseInt(currRow[2 * j + 2]), parseInt(currRow[2 * j + 3])])
    }
    map[parseInt(currRow[1])][parseInt(currRow[0])] = { id: "button", effect, active: false, dir: map[parseInt(currRow[1])][parseInt(currRow[0])] }
  }
  return [map, clones];

}
async function fetchLevels(url, gamestate) {
  const response = await fetch(url);
  const text = await response.text();
  const levels = text.split("\n");
  for (let level of levels) {
    await fetchLevel(level).then(([map, clones]) => {
      gamestate.levels[level] = map;
      gamestate.clones[level] = clones;
    });
  }
  return levels;
}
function loadImage(url) {
  return new Promise((resolve) => {
    fetch(url).then(response => response.blob()).then(blob => {
      let img = document.createElement("img");
      img.addEventListener("load", () => resolve(img));
      img.src = URL.createObjectURL(blob);
    })
  })
}
import WIIMote from "./wiimote/wiimote.js"

let requestButton = document.getElementById("request-hid-device");

var wiimote = undefined;
requestButton.addEventListener("click", async () => {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }],
    });

    device = devices[0];
    wiimote = new WIIMote(device)

  } catch (error) {
    console.log("An error occurred.", error);
  }

  if (!device) {
    console.log("No device was selected.");
  } else {
    console.log(`HID: ${device.productName}`);

    initCanvas()

  }
});

function initCanvas() {
  wiimote.BtnListener = (buttons) => {
    //console.log(buttons);
  }
  window.xs = []
  window.ys = []
  window.zs = []
  let horizontal = -100;
  let vertical = -100;
  wiimote.AccListener = (x, y, z) => {
    xs.push(x)
    ys.push(y)
    zs.push(z)
    if (x >= 150) {
      horizontal = xs.length;
    }
    if (horizontal + 10 === xs.length) {
      const v = xs.slice(xs.length - 20, xs.length - 1);
      const m = Math.min(...v);
      const i = v.indexOf(m);
      console.log(v, m, i)
      if (i < 10) {
        console.log("right");
      } else {
        console.log("left")
      }
    }
    if (y >= 150) {
      vertical = ys.length;
    }
    if (vertical + 10 === ys.length) {
      const v = xs.slice(ys.length - 20, ys.length - 1);
      const m = Math.min(...v);
      const i = v.indexOf(m);
      console.log(v, m, i)
      if (i < 10) {
        console.log("up");
      } else {
        console.log("down")
      }
    }
  }
}
async function main() {
  const canvas = document.getElementById("game");
  canvas.focus()
  const ctx = canvas.getContext("2d")
  const gamestate = {}
  gamestate.char = Character();
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gamestate.width = canvas.width;
    gamestate.height = canvas.height;
    console.log("Resize")
  }
  resize()

  new ResizeObserver(resize).observe(canvas)
  gamestate.input = Input(canvas);
  gamestate.levels = {};
  gamestate.clones = {};
  gamestate.images = {};
  gamestate.restart = false;
  const player = loadImage("images/cheese.svg");
  const gplayer = loadImage("images/orangeCheese.svg");
  const gravityOn = loadImage("images/tiles_GravityOn.svg");
  const gravityOff = loadImage("images/tiles_GravityOff.svg");
  const winButton = loadImage("images/tiles_WinButton.svg");
  const block = loadImage("images/tiles_Block.svg");
  const door = loadImage("images/tiles_Door.svg");
  const death = loadImage("images/tiles_Death.svg");
  const button = loadImage("images/tiles_Button.svg");
  const levelNames = fetchLevels("levels.txt", gamestate);
  await Promise.all([player, gplayer, gravityOn, gravityOff, winButton, block, door, death, button, levelNames]);
  gamestate.levelNames = await levelNames;
  gamestate.images["player"] = await player;
  gamestate.images["ghostplayer"] = await gplayer;
  gamestate.images["gravityon"] = await gravityOn;
  gamestate.images["gravityoff"] = await gravityOff;
  gamestate.images["winbutton"] = await winButton;
  gamestate.images["block"] = await block;
  gamestate.images["door"] = await door;
  gamestate.images["death"] = await death;
  gamestate.images["button"] = await button;
  gamestate.currLevel = gamestate.levelNames[0];
  gamestate.levelCounter = 0
  gamestate.histories = []
  placeCharacters(gamestate);
  function loop() {
    logic(gamestate);
    draw(gamestate, ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.debug = gamestate
}
main()
window.restart = () => {
  debug.restart = false;
  debug.histories = [];
  placeCharacters(debug);
}