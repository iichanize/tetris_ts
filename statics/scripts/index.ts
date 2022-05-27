import Mino from "./Mino";

const wrapper: HTMLBodyElement = <HTMLBodyElement>document.getElementById("id_wrapper");
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("id_canvas");
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");

let tile_size: number;
let queue_mino: Mino[] = [];
let duration: number = 25;
let timer: number = 0;
let frame_x: number = 0;
let current_index: number = 0;
let game_end: boolean = false;

let frame_y: number = 0;
let field: number[] = [];
let buf_flag: boolean = true;
let collision_flag: boolean = false;

for (let i: number = 0; i <= 21; i++) {
  for (let j: number = 0; j <= 11; j++) {
    if (j === 0 || j === 11 || i === 21) {
      field.push(1);
    } else {
      field.push(0);
    }
  }
}
let temp_field: number[] = [];
for (let i: number = 0; i <= 21; i++) {
  for (let j: number = 0; j <= 11; j++) {
    if (j === 0 || j === 11 || i === 21) {
      temp_field.push(1);
    } else {
      temp_field.push(0);
    }
  }
}

const mino_shape: { [index: string]: number[] } = Mino.shape_list;

const mino_name: string[] = Mino.name_list;

let length_last_mino_name = Mino.name_list.length;

let score_counter = 0;
let REN = 0;
let flag_ren = false;
let total_score = 0;

let mino_buffer: Mino[] = [];
const setHold = function (): void {
  if (mino_buffer[0] === undefined && buf_flag) {
    let t: number = Math.floor(Math.random() * mino_name.length);
    if (mino_name.length === 0) {
      refill_mino_name();
    }
    queue_mino.push(new Mino(mino_name[t], frame_x + 14 * tile_size, 6 * tile_size));
    queue_mino[current_index + 2].y = 3 * tile_size;
    queue_mino[current_index + 1].y = 0;
    queue_mino[current_index + 1].x = frame_x + 4 * tile_size;
    mino_buffer[0] = queue_mino[current_index];
    queue_mino.splice(current_index, 1);
    mino_buffer[0].x = frame_x - 5 * tile_size;
    mino_buffer[0].y = 3 * tile_size;
    mino_buffer[0].shape = JSON.parse(JSON.stringify(mino_shape[mino_buffer[0].name]));
    refreshDisplay();
    mino_name.splice(t, 1);
    buf_flag = false;
  } else if (buf_flag) {
    let temp: Mino = queue_mino[current_index]; //queue_mino[current_index]とbufferを入れ替え
    queue_mino[current_index] = mino_buffer[0];
    mino_buffer[0] = temp;
    mino_buffer[0].x = frame_x - 5 * tile_size;
    mino_buffer[0].y = 3 * tile_size;
    mino_buffer[0].shape = JSON.parse(JSON.stringify(mino_shape[mino_buffer[0].name]));
    queue_mino[current_index].y = 0;
    queue_mino[current_index].x = frame_x + 4 * tile_size;
    refreshDisplay();
    buf_flag = false;
  }
};
let stack: number[] = [];

const refreshQueue = function (): void {
  const clear_mino: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i: number = 0; i < queue_mino.length; i++) {
    if (JSON.stringify(queue_mino[i].shape) == JSON.stringify(clear_mino)) {
      queue_mino.splice(i, 1);
      current_index--;
    }
  }
};

const checkFillLines = function (): void {
  let counter: number = 0;
  for (let i: number = 0; i < 20; i++) {
    //各行について見る
    counter = 0;
    for (let j: number = 0; j < 10; j++) {
      //合計して10なら埋まっている状態
      counter += field[j + 1 + (i + 1) * 12];
    }
    if (counter === 10) {
      score_counter++;
      //行iが埋まっているとき
      for (let g: number = i; g >= 0; g--) {
        for (let h: number = 0; h < 10; h++) {
          field[h + 1 + (g + 1) * 12] = field[h + 1 + g * 12];
        }
      }
      stack.push(i);
      for (let k: number = 0; k < queue_mino.length - 3; k++) {
        //フィールド上に存在しているミノを確認
        let idx_x: number = (queue_mino[k].x - frame_x) / tile_size + 1;
        let idx_y: number = (queue_mino[k].y - frame_y) / tile_size + 1;
        if (idx_y - 1 + 2 < i) {
          queue_mino[k].y += tile_size;
        } else {
          for (let l: number = 0; l < 5; l++) {
            //ミノを構成している5*5のマスを確認
            for (let m: number = 5; m >= 0; m--) {
              if (idx_y - 1 - 2 + m <= i) {
                if (l + (m - 1) * 5 >= 0) {
                  queue_mino[k].shape[l + m * 5] = queue_mino[k].shape[l + (m - 1) * 5];
                } else {
                  queue_mino[k].shape[l + m * 5] = 0;
                }
              }
            }
          }
        }
      }
      refreshDisplay();
    }
  }
  if (score_counter > 0) {
    flag_ren = true;
  } else {
    flag_ren = false;
  }
  total_score += score_counter * score_counter * 500;
  total_score += score_counter * score_counter * REN * 100;
  score_counter = 0;
};

const getSize = function (): void {
  canvas.width = wrapper.offsetWidth;
  tile_size = Math.floor(canvas.width * 0.03);
  canvas.height = tile_size * 21;
};

const drawBG = function (): void {
  let frame_width: number = Math.floor(canvas.width * 0.3 + 2 * tile_size);
  frame_x = Math.floor(canvas.width * 0.5 - frame_width * 0.5);
  frame_y = 0;

  writeString("HOLD", frame_x - 5 * tile_size, tile_size, "20pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
  writeString("NEXT", frame_x + 14 * tile_size, tile_size, "20pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
  writeString("SCORE", frame_x + 14 * tile_size, 19 * tile_size, "15pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
  writeString(
    total_score.toString(),
    frame_x + 14 * tile_size,
    20 * tile_size,
    "15pt Arial",
    [0, 0, 0, 1],
    [0, 0, 0, 0]
  );
  for (let i: number = 0; i < 10; i++) {
    for (let j: number = 0; j < 20; j++) {
      ctx.beginPath();
      ctx.rect(frame_x + i * tile_size, frame_y + j * tile_size, tile_size, tile_size);
      ctx.fillStyle = "azure";
      ctx.strokeStyle = "black";
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  }
  for (let i: number = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.rect(frame_x - tile_size, frame_y + i * tile_size, tile_size, tile_size);
    ctx.rect(frame_x + 10 * tile_size, frame_y + i * tile_size, tile_size, tile_size);
    ctx.fillStyle = "gray";
    ctx.strokeStyle = "black";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  for (let i: number = -1; i < 11; i++) {
    ctx.beginPath();
    ctx.rect(frame_x + i * tile_size, frame_y + 20 * tile_size, tile_size, tile_size);
    ctx.fillStyle = "gray";
    ctx.strokeStyle = "black";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
};

const applyMinosToField = function (): void {
  for (let s: number = 0; s < 10; s++) {
    for (let t: number = 0; t < 21; t++) {
      temp_field[s + 1 + t * 12] = 0;
    }
  }
  for (let i: number = 0; i < queue_mino.length - 2; i++) {
    let idx_x: number = (queue_mino[i].x - frame_x) / tile_size + 1;
    let idx_y: number = (queue_mino[i].y - frame_y) / tile_size + 1;
    if (collision_flag === false) {
      for (let a: number = 0; a < 5; a++) {
        for (let b: number = 0; b < 5; b++) {
          if (queue_mino[i].shape[a + 5 * b] === 1) {
            temp_field[idx_x - 2 + a + (idx_y - 2 + b) * 12] = 1;
          }
        }
      }
    }
  }
};

const writeString = function (
  str: string,
  x: number,
  y: number,
  font: string,
  fontcolor: number[],
  strokecolor: number[]
): void {
  ctx.beginPath();
  ctx.font = font;
  ctx.fillStyle = "rgba(" + fontcolor + ")";
  ctx.strokeStyle = "rgba(" + strokecolor + ")";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(str, x, y, canvas.width);
  ctx.strokeText(str, x, y, canvas.width);
  ctx.closePath();
};
const refill_mino_name = function (): void {
  mino_name.push("T");
  mino_name.push("I");
  mino_name.push("O");
  mino_name.push("L");
  mino_name.push("J");
  mino_name.push("S");
  mino_name.push("Z");
};
var checkREN = function () {
  if (length_last_mino_name != mino_name.length) {
    if (flag_ren) {
      REN++;
    } else {
      REN = 0;
    }
    length_last_mino_name = mino_name.length;
  }
};
const drawDisplay = function (): void {
  if (timer >= duration) {
    checkFillLines();
    applyMinosToField();
    refreshQueue();
    checkREN();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();

    let idx_x: number = (queue_mino[current_index].x - frame_x) / tile_size + 1;
    let idx_y: number = (queue_mino[current_index].y - frame_y) / tile_size + 1;
    for (let a: number = 0; a < 5; a++) {
      for (let b: number = 0; b < 5; b++) {
        if (queue_mino[current_index].shape[a + 5 * b] === 1 && field[idx_x - 2 + a + (idx_y - 2 + b + 1) * 12] === 1) {
          collision_flag = true;
          console.clear();
          break;
        }
      }
    }
    if (field[5] === 1) {
      console.log("END");
      game_end = true;
    } else if (queue_mino[current_index].y + tile_size < 20 * tile_size && collision_flag === false) {
      queue_mino[current_index].y += tile_size;
    } else {
      collision_flag = false;
      buf_flag = true;
      field = JSON.parse(JSON.stringify(temp_field)); //配列のディープコピーはJSON.parse(JSON.stringify())で実装できる
      for (let i: number = 0; i < 22; i++) {
        console.log(
          ("00" + i).slice(-2),
          field[i * 12],
          field[i * 12 + 1],
          field[i * 12 + 2],
          field[i * 12 + 3],
          field[i * 12 + 4],
          field[i * 12 + 5],
          field[i * 12 + 6],
          field[i * 12 + 7],
          field[i * 12 + 8],
          field[i * 12 + 9],
          field[i * 12 + 10],
          field[i * 12 + 11]
        );
      }
      if (mino_name.length === 0) {
        refill_mino_name();
      }
      let t: number = Math.floor(Math.random() * mino_name.length);
      queue_mino.push(new Mino(mino_name[t], frame_x + 14 * tile_size, 6 * tile_size));
      queue_mino[current_index + 2].y = 3 * tile_size;
      queue_mino[current_index + 1].y = -tile_size;
      queue_mino[current_index + 1].x = frame_x + 4 * tile_size;
      mino_name.splice(t, 1);
      current_index++;
    }
    for (let i: number = 0; i < queue_mino.length; i++) {
      queue_mino[i].drawMino(ctx, tile_size);
    }
    if (mino_buffer[0] !== undefined) {
      mino_buffer[0].drawMino(ctx, tile_size);
    }
    if (field[5] === 1) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(10, 10, 10, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.closePath();
      writeString("GAME OVER", canvas.width / 2, canvas.height / 2, "50pt Arial", [255, 255, 255, 1], [0, 0, 0, 1]);
    }

    timer = 0;
  }
};
const loop = function (ts: DOMHighResTimeStamp): void {
  if (!game_end) {
    timer += 1;
    drawDisplay();
    window.requestAnimationFrame((ts: DOMHighResTimeStamp) => loop(ts));
  }
};

window.requestAnimationFrame((ts: DOMHighResTimeStamp) => loop(ts));

const refreshDisplay = function (): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBG();
  for (let i: number = 0; i < queue_mino.length; i++) {
    queue_mino[i].drawMino(ctx, tile_size);
  }
  if (mino_buffer[0] !== undefined) {
    mino_buffer[0].drawMino(ctx, tile_size);
  }
};

window.addEventListener("resize", () => {
  getSize();
  drawDisplay();
});

window.addEventListener("load", () => {
  getSize();
  drawBG();
  let t: number = Math.floor(Math.random() * mino_name.length);
  queue_mino.push(new Mino(mino_name[t], frame_x + 4 * tile_size, -tile_size));
  mino_name.splice(t, 1);
  t = Math.floor(Math.random() * mino_name.length);
  queue_mino.push(new Mino(mino_name[t], frame_x + 14 * tile_size, 3 * tile_size));
  mino_name.splice(t, 1);
  t = Math.floor(Math.random() * mino_name.length);
  queue_mino.push(new Mino(mino_name[t], frame_x + 14 * tile_size, 6 * tile_size));
  mino_name.splice(t, 1);
});
document.addEventListener("keydown", KeyDownFunc);

function KeyDownFunc(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") {
    let leftflag: boolean = true;
    let idx_x: number = (queue_mino[current_index].x - frame_x) / tile_size + 1;
    let idx_y: number = (queue_mino[current_index].y - frame_y) / tile_size + 1;
    for (let i: number = 0; i < 5; i++) {
      for (let j: number = 0; j < 5; j++) {
        if (queue_mino[current_index].shape[i + 5 * j] === 1 && field[idx_x - 2 + i - 1 + (idx_y - 2 + j) * 12] === 1) {
          leftflag = false;
        }
      }
    }
    if (leftflag) {
      queue_mino[current_index].x -= tile_size;
      refreshDisplay();
    }
  } else if (e.key === "ArrowRight") {
    let rightflag: boolean = true;
    let idx_x: number = (queue_mino[current_index].x - frame_x) / tile_size + 1;
    let idx_y: number = (queue_mino[current_index].y - frame_y) / tile_size + 1;
    for (let i: number = 0; i < 5; i++) {
      for (let j: number = 0; j < 5; j++) {
        if (queue_mino[current_index].shape[i + 5 * j] === 1 && field[idx_x - 2 + i + 1 + (idx_y - 2 + j) * 12] === 1) {
          rightflag = false;
        }
      }
    }
    if (rightflag) {
      queue_mino[current_index].x += tile_size;
      refreshDisplay();
    }
  } else if (e.key === "ArrowDown") {
    let downflag: boolean = true;
    let idx_x: number = (queue_mino[current_index].x - frame_x) / tile_size + 1;
    let idx_y: number = (queue_mino[current_index].y - frame_y) / tile_size + 1;
    for (let i: number = 0; i < 5; i++) {
      for (let j: number = 0; j < 5; j++) {
        if (queue_mino[current_index].shape[i + 5 * j] === 1 && field[idx_x - 2 + i + (idx_y - 2 + j + 1) * 12] === 1) {
          downflag = false;
        }
      }
    }
    if (downflag) {
      queue_mino[current_index].y += tile_size;
      timer = 0;
      total_score += 10;
      refreshDisplay();
    }
  } else if (e.key === "z") {
    queue_mino[current_index].spinLeft(field, frame_x, frame_y, tile_size, refreshDisplay);
  } else if (e.key === "x") {
    queue_mino[current_index].spinRight(field, frame_x, frame_y, tile_size, refreshDisplay);
  } else if (e.key === "a") {
    setHold();
  }
}
