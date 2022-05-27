export default class Mino {
  name: string;
  shape: number[];
  color: string;
  x: number;
  y: number;
  public static color_list: { [index: string]: string } = {
    T: "blueviolet",
    I: "cyan",
    L: "blue",
    J: "orange",
    O: "yellow",
    S: "lime",
    Z: "red",
  };
  public static shape_list: { [index: string]: number[] } = {
    T: [
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    I: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    L: [
      0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    J: [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    O: [
      0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    S: [
      0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    Z: [
      0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  };
  public static name_list: string[] = ["T", "I", "O", "L", "J", "S", "Z"];
  constructor(name: string, x: number, y: number) {
    this.name = name;
    this.shape = JSON.parse(JSON.stringify(Mino.shape_list[name]));
    this.color = JSON.parse(JSON.stringify(Mino.color_list[name]));
    this.x = x;
    this.y = y;
  }
  drawMino(ctx: CanvasRenderingContext2D, tile_size: number) {
    for (let i: number = 0; i < 5; i++) {
      for (let j: number = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.rect(
          this.x - 2 * tile_size + i * tile_size,
          this.y - 2 * tile_size + j * tile_size,
          tile_size,
          tile_size
        );
        if (this.shape[i + j * 5] === 1) {
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        } else {
          continue;
        }
      }
    }
  }
  spinLeft(
    field: number[],
    frame_x: number,
    frame_y: number,
    tile_size: number,
    refreshDisplay: () => void
  ) {
    if (this.name !== "O") {
      let temp: number[] = new Array(25);
      for (let i: number = 0; i < 5; i++) {
        for (let j: number = 0; j < 5; j++) {
          temp[i + j * 5] = this.shape[4 - j + i * 5];
        }
      }
      let leftflag: boolean = true;
      let idx_x: number = (this.x - frame_x) / tile_size + 1;
      let idx_y: number = (this.y - frame_y) / tile_size + 1;
      for (let i: number = 0; i < 5; i++) {
        for (let j: number = 0; j < 5; j++) {
          if (
            temp[i + 5 * j] === 1 &&
            field[idx_x - 2 + i + (idx_y - 2 + j) * 12] === 1
          ) {
            leftflag = false;
          }
        }
      }
      if (leftflag) {
        this.shape = temp;
        refreshDisplay();
      }
    }
  }
  spinRight(
    field: number[],
    frame_x: number,
    frame_y: number,
    tile_size: number,
    refreshDisplay: () => void
  ) {
    if (this.name !== "O") {
      let temp: number[] = new Array(25);
      for (let i: number = 0; i < 5; i++) {
        for (let j: number = 0; j < 5; j++) {
          temp[i + j * 5] = this.shape[j + (4 - i) * 5];
        }
      }
      let rightflag: boolean = true;
      let idx_x: number = (this.x - frame_x) / tile_size + 1;
      let idx_y: number = (this.y - frame_y) / tile_size + 1;
      for (let i: number = 0; i < 5; i++) {
        for (let j: number = 0; j < 5; j++) {
          if (
            temp[i + 5 * j] === 1 &&
            field[idx_x - 2 + i + (idx_y - 2 + j) * 12] === 1
          ) {
            rightflag = false;
          }
        }
      }
      if (rightflag) {
        this.shape = temp;
        refreshDisplay();
      }
    }
  }
}
