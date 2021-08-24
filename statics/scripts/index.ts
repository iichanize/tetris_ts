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
// console.log(field);
const mino_shape: { [index: string]: number[] } = {
    T: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    I: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    L: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    J: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    O: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    S: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    Z: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
const mino_color: { [index: string]: string } = {
    T: "blueviolet",
    I: "cyan",
    L: "blue",
    J: "orange",
    O: "yellow",
    S: "lime",
    Z: "red",
};
const mino_name: string[] = ["T", "I", "O", "L", "J", "S", "Z"];
class Mino {
    name: string;
    shape: number[];
    color: string;
    x: number;
    y: number;
    constructor(name: string, x: number, y: number) {
        this.name = name;
        this.shape = JSON.parse(JSON.stringify(mino_shape[name]));
        this.color = JSON.parse(JSON.stringify(mino_color[name]));
        this.x = x;
        this.y = y;
    }
    drawMino() {
        for (let i: number = 0; i < 5; i++) {
            for (let j: number = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.rect(this.x - 2 * tile_size + i * tile_size, this.y - 2 * tile_size + j * tile_size, tile_size, tile_size);
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
    spinLeft() {
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
                    if (temp[i + 5 * j] === 1 && field[idx_x - 2 + i + (idx_y - 2 + j) * 12] === 1) {
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
    spinRight() {
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
                    if (temp[i + 5 * j] === 1 && field[idx_x - 2 + i + (idx_y - 2 + j) * 12] === 1) {
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
                            // for (let m: number = 0; m < 5; m++) {
                            // if ((queue_mino[k].y - frame_y) / tile_size - 2 + m <= i) {
                            if (idx_y - 1 - 2 + m <= i) {
                                if (l + (m - 1) * 5 >= 0) {
                                    queue_mino[k].shape[l + m * 5] = queue_mino[k].shape[l + (m - 1) * 5];
                                    // field[idx_x - 2 + l + (idx_y - 2 + m) * 12] = field[idx_x - 2 + l + (idx_y - 2 + m - 1) * 12];
                                } else {
                                    queue_mino[k].shape[l + m * 5] = 0;
                                    // field[idx_x - 2 + l + (idx_y - 2 + m) * 12] = field[idx_x - 2 + l + (idx_y - 2 + m - 1) * 12];
                                }
                                // falldown(i);
                            }
                        }
                    }
                }
            }
            refreshDisplay();
        }
    }
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
        // console.log(current_index, queue_mino[i]);
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

const writeString = function (str: string, x: number, y: number, font: string, fontcolor: number[], strokecolor: number[]): void {
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
const drawDisplay = function (): void {
    if (timer >= duration) {
        checkFillLines();
        applyMinosToField();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBG();

        let idx_x: number = (queue_mino[current_index].x - frame_x) / tile_size + 1;
        let idx_y: number = (queue_mino[current_index].y - frame_y) / tile_size + 1;
        for (let a: number = 0; a < 5; a++) {
            for (let b: number = 0; b < 5; b++) {
                if (queue_mino[current_index].shape[a + 5 * b] === 1 && field[idx_x - 2 + a + (idx_y - 2 + b + 1) * 12] === 1) {
                    collision_flag = true;
                    console.clear();
                    // console.log(idx_x - 2 + a, idx_y - 2 + b, field[idx_x - 2 + a + (idx_y - 2 + b) * 12]);
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
            queue_mino[i].drawMino();
        }
        if (mino_buffer[0] !== undefined) {
            mino_buffer[0].drawMino();
        }
        if (field[5] === 1) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(10, 10, 10, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.closePath();
            writeString("GAME OVER", canvas.width / 2, canvas.height / 2, "50pt Arial", [255, 255, 255, 1], [0, 0, 0, 1]);
        }

        timer = 0;
        // console.log(ts);
    }
};
const loop = function (ts: DOMTimeStamp): void {
    if (!game_end) {
        timer += 1;
        drawDisplay();
        window.requestAnimationFrame((ts: DOMTimeStamp) => loop(ts));
    }
};

window.requestAnimationFrame((ts: DOMTimeStamp) => loop(ts));

const refreshDisplay = function (): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    for (let i: number = 0; i < queue_mino.length; i++) {
        queue_mino[i].drawMino();
    }
    if (mino_buffer[0] !== undefined) {
        mino_buffer[0].drawMino();
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
document.addEventListener("keyup", KeyUpFunc);

function KeyDownFunc(e: KeyboardEvent) {
    // console.log("key=" + e.key + ":DOWN")
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
            refreshDisplay();
        }
    } else if (e.key === "z") {
        queue_mino[current_index].spinLeft();
    } else if (e.key === "x") {
        queue_mino[current_index].spinRight();
    } else if (e.key === "a") {
        setHold();
    }
}

function KeyUpFunc(e: KeyboardEvent) {
    // console.log("key=" + e.key + ":UP")
}
