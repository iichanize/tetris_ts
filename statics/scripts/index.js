"use strict";
var wrapper = document.getElementById("id_wrapper");
var canvas = document.getElementById("id_canvas");
var ctx = canvas.getContext("2d");
var tile_size;
var queue_mino = [];
var duration = 25;
var timer = 0;
var frame_x = 0;
var current_index = 0;
var game_end = false;
var frame_y = 0;
var field = [];
var buf_flag = true;
var collision_flag = false;
for (var i = 0; i <= 21; i++) {
    for (var j = 0; j <= 11; j++) {
        if (j === 0 || j === 11 || i === 21) {
            field.push(1);
        }
        else {
            field.push(0);
        }
    }
}
var temp_field = [];
for (var i = 0; i <= 21; i++) {
    for (var j = 0; j <= 11; j++) {
        if (j === 0 || j === 11 || i === 21) {
            temp_field.push(1);
        }
        else {
            temp_field.push(0);
        }
    }
}
// console.log(field);
var mino_shape = {
    T: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    I: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    L: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    J: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    O: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    S: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    Z: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
var mino_color = {
    T: "blueviolet",
    I: "cyan",
    L: "blue",
    J: "orange",
    O: "yellow",
    S: "lime",
    Z: "red",
};
var mino_name = ["T", "I", "O", "L", "J", "S", "Z"];
var length_last_mino_name = mino_name.length;
var length_last_queue_mino = queue_mino.length;
var score_counter = 0;
var REN = 0;
var flag_ren = false;
var total_score = 0;
var Mino = /** @class */ (function () {
    function Mino(name, x, y) {
        this.name = name;
        this.shape = JSON.parse(JSON.stringify(mino_shape[name]));
        this.color = JSON.parse(JSON.stringify(mino_color[name]));
        this.x = x;
        this.y = y;
    }
    Mino.prototype.drawMino = function () {
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.rect(this.x - 2 * tile_size + i * tile_size, this.y - 2 * tile_size + j * tile_size, tile_size, tile_size);
                if (this.shape[i + j * 5] === 1) {
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }
                else {
                    continue;
                }
            }
        }
    };
    Mino.prototype.spinLeft = function () {
        if (this.name !== "O") {
            var temp = new Array(25);
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                    temp[i + j * 5] = this.shape[4 - j + i * 5];
                }
            }
            var leftflag = true;
            var idx_x = (this.x - frame_x) / tile_size + 1;
            var idx_y = (this.y - frame_y) / tile_size + 1;
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
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
    };
    Mino.prototype.spinRight = function () {
        if (this.name !== "O") {
            var temp = new Array(25);
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                    temp[i + j * 5] = this.shape[j + (4 - i) * 5];
                }
            }
            var rightflag = true;
            var idx_x = (this.x - frame_x) / tile_size + 1;
            var idx_y = (this.y - frame_y) / tile_size + 1;
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
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
    };
    return Mino;
}());
var mino_buffer = [];
var setHold = function () {
    if (mino_buffer[0] === undefined && buf_flag) {
        var t = Math.floor(Math.random() * mino_name.length);
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
    }
    else if (buf_flag) {
        var temp = queue_mino[current_index]; //queue_mino[current_index]とbufferを入れ替え
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
var stack = [];
var refreshQueue = function () {
    var clear_mino = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < queue_mino.length; i++) {
        if (JSON.stringify(queue_mino[i].shape) == JSON.stringify(clear_mino)) {
            queue_mino.splice(i, 1);
            current_index--;
        }
    }
};
var checkFillLines = function () {
    var counter = 0;
    for (var i = 0; i < 20; i++) {
        //各行について見る
        counter = 0;
        for (var j = 0; j < 10; j++) {
            //合計して10なら埋まっている状態
            counter += field[j + 1 + (i + 1) * 12];
        }
        if (counter === 10) {
            score_counter++;
            //行iが埋まっているとき
            for (var g = i; g >= 0; g--) {
                for (var h = 0; h < 10; h++) {
                    field[h + 1 + (g + 1) * 12] = field[h + 1 + g * 12];
                }
            }
            stack.push(i);
            for (var k = 0; k < queue_mino.length - 3; k++) {
                //フィールド上に存在しているミノを確認
                var idx_x = (queue_mino[k].x - frame_x) / tile_size + 1;
                var idx_y = (queue_mino[k].y - frame_y) / tile_size + 1;
                if (idx_y - 1 + 2 < i) {
                    queue_mino[k].y += tile_size;
                }
                else {
                    for (var l = 0; l < 5; l++) {
                        //ミノを構成している5*5のマスを確認
                        for (var m = 5; m >= 0; m--) {
                            // for (let m: number = 0; m < 5; m++) {
                            // if ((queue_mino[k].y - frame_y) / tile_size - 2 + m <= i) {
                            if (idx_y - 1 - 2 + m <= i) {
                                if (l + (m - 1) * 5 >= 0) {
                                    queue_mino[k].shape[l + m * 5] = queue_mino[k].shape[l + (m - 1) * 5];
                                    // field[idx_x - 2 + l + (idx_y - 2 + m) * 12] = field[idx_x - 2 + l + (idx_y - 2 + m - 1) * 12];
                                }
                                else {
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
    if (score_counter > 0) {
        flag_ren = true;
    }
    else {
        flag_ren = false;
    }
    total_score += score_counter * score_counter * 500;
    total_score += score_counter * score_counter * REN * 100;
    score_counter = 0;
};
var getSize = function () {
    canvas.width = wrapper.offsetWidth;
    tile_size = Math.floor(canvas.width * 0.03);
    canvas.height = tile_size * 21;
};
var drawBG = function () {
    var frame_width = Math.floor(canvas.width * 0.3 + 2 * tile_size);
    frame_x = Math.floor(canvas.width * 0.5 - frame_width * 0.5);
    frame_y = 0;
    writeString("HOLD", frame_x - 5 * tile_size, tile_size, "20pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
    writeString("NEXT", frame_x + 14 * tile_size, tile_size, "20pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
    writeString("SCORE", frame_x + 14 * tile_size, 19 * tile_size, "15pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
    writeString(total_score.toString(), frame_x + 14 * tile_size, 20 * tile_size, "15pt Arial", [0, 0, 0, 1], [0, 0, 0, 0]);
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 20; j++) {
            ctx.beginPath();
            ctx.rect(frame_x + i * tile_size, frame_y + j * tile_size, tile_size, tile_size);
            ctx.fillStyle = "azure";
            ctx.strokeStyle = "black";
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    }
    for (var i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.rect(frame_x - tile_size, frame_y + i * tile_size, tile_size, tile_size);
        ctx.rect(frame_x + 10 * tile_size, frame_y + i * tile_size, tile_size, tile_size);
        ctx.fillStyle = "gray";
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    for (var i = -1; i < 11; i++) {
        ctx.beginPath();
        ctx.rect(frame_x + i * tile_size, frame_y + 20 * tile_size, tile_size, tile_size);
        ctx.fillStyle = "gray";
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
};
var applyMinosToField = function () {
    for (var s = 0; s < 10; s++) {
        for (var t = 0; t < 21; t++) {
            temp_field[s + 1 + t * 12] = 0;
        }
    }
    for (var i = 0; i < queue_mino.length - 2; i++) {
        var idx_x = (queue_mino[i].x - frame_x) / tile_size + 1;
        var idx_y = (queue_mino[i].y - frame_y) / tile_size + 1;
        // console.log(current_index, queue_mino[i]);
        if (collision_flag === false) {
            for (var a = 0; a < 5; a++) {
                for (var b = 0; b < 5; b++) {
                    if (queue_mino[i].shape[a + 5 * b] === 1) {
                        temp_field[idx_x - 2 + a + (idx_y - 2 + b) * 12] = 1;
                    }
                }
            }
        }
    }
};
var writeString = function (str, x, y, font, fontcolor, strokecolor) {
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
var refill_mino_name = function () {
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
        }
        else {
            REN = 0;
        }
        length_last_mino_name = mino_name.length;
        length_last_queue_mino = queue_mino.length;
    }
};
var drawDisplay = function () {
    if (timer >= duration) {
        checkFillLines();
        applyMinosToField();
        refreshQueue();
        checkREN();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBG();
        var idx_x = (queue_mino[current_index].x - frame_x) / tile_size + 1;
        var idx_y = (queue_mino[current_index].y - frame_y) / tile_size + 1;
        for (var a = 0; a < 5; a++) {
            for (var b = 0; b < 5; b++) {
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
        }
        else if (queue_mino[current_index].y + tile_size < 20 * tile_size && collision_flag === false) {
            queue_mino[current_index].y += tile_size;
        }
        else {
            collision_flag = false;
            buf_flag = true;
            field = JSON.parse(JSON.stringify(temp_field)); //配列のディープコピーはJSON.parse(JSON.stringify())で実装できる
            for (var i = 0; i < 22; i++) {
                console.log(("00" + i).slice(-2), field[i * 12], field[i * 12 + 1], field[i * 12 + 2], field[i * 12 + 3], field[i * 12 + 4], field[i * 12 + 5], field[i * 12 + 6], field[i * 12 + 7], field[i * 12 + 8], field[i * 12 + 9], field[i * 12 + 10], field[i * 12 + 11]);
            }
            if (mino_name.length === 0) {
                refill_mino_name();
            }
            var t = Math.floor(Math.random() * mino_name.length);
            queue_mino.push(new Mino(mino_name[t], frame_x + 14 * tile_size, 6 * tile_size));
            queue_mino[current_index + 2].y = 3 * tile_size;
            queue_mino[current_index + 1].y = -tile_size;
            queue_mino[current_index + 1].x = frame_x + 4 * tile_size;
            mino_name.splice(t, 1);
            current_index++;
        }
        for (var i = 0; i < queue_mino.length; i++) {
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
var loop = function (ts) {
    if (!game_end) {
        timer += 1;
        drawDisplay();
        window.requestAnimationFrame(function (ts) { return loop(ts); });
    }
};
window.requestAnimationFrame(function (ts) { return loop(ts); });
var refreshDisplay = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    for (var i = 0; i < queue_mino.length; i++) {
        queue_mino[i].drawMino();
    }
    if (mino_buffer[0] !== undefined) {
        mino_buffer[0].drawMino();
    }
};
window.addEventListener("resize", function () {
    getSize();
    drawDisplay();
});
window.addEventListener("load", function () {
    getSize();
    drawBG();
    var t = Math.floor(Math.random() * mino_name.length);
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
function KeyDownFunc(e) {
    // console.log("key=" + e.key + ":DOWN")
    if (e.key === "ArrowLeft") {
        var leftflag = true;
        var idx_x = (queue_mino[current_index].x - frame_x) / tile_size + 1;
        var idx_y = (queue_mino[current_index].y - frame_y) / tile_size + 1;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                if (queue_mino[current_index].shape[i + 5 * j] === 1 && field[idx_x - 2 + i - 1 + (idx_y - 2 + j) * 12] === 1) {
                    leftflag = false;
                }
            }
        }
        if (leftflag) {
            queue_mino[current_index].x -= tile_size;
            refreshDisplay();
        }
    }
    else if (e.key === "ArrowRight") {
        var rightflag = true;
        var idx_x = (queue_mino[current_index].x - frame_x) / tile_size + 1;
        var idx_y = (queue_mino[current_index].y - frame_y) / tile_size + 1;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                if (queue_mino[current_index].shape[i + 5 * j] === 1 && field[idx_x - 2 + i + 1 + (idx_y - 2 + j) * 12] === 1) {
                    rightflag = false;
                }
            }
        }
        if (rightflag) {
            queue_mino[current_index].x += tile_size;
            refreshDisplay();
        }
    }
    else if (e.key === "ArrowDown") {
        var downflag = true;
        var idx_x = (queue_mino[current_index].x - frame_x) / tile_size + 1;
        var idx_y = (queue_mino[current_index].y - frame_y) / tile_size + 1;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
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
    }
    else if (e.key === "z") {
        queue_mino[current_index].spinLeft();
    }
    else if (e.key === "x") {
        queue_mino[current_index].spinRight();
    }
    else if (e.key === "a") {
        setHold();
    }
}
function KeyUpFunc(e) {
    // console.log("key=" + e.key + ":UP")
}
