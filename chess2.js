/*

ROOK optimering:
Find først cross helt ud til kanterne.
klip DEREFTER enderne af så de passer med indexOf (position repræsenteret med Et tal fra 0 til 63)

Til undo:
0 = rykkede
1 = takes
2 = rc
3 = lc

last move = [0, brikkens gamle data, brikkens nye data] (Tager hensyn til lastmove)

all moves = [alle last moves bliver pushed]

all moves gør så man kan gå mere end ét træk tilbage





Swap side ?
*/


c = document.getElementById("visuals")
ctx = c.getContext("2d");
c.width = 800
c.height = 400

c.onmousemove = mousemove
c.onmousedown = mousedown
document.onmouseup = mouseup

//Finds canvas' offset from (0, 0) on website
canvas_boundary = c.getBoundingClientRect()

//Disables right click menu in canvas
c.addEventListener('contextmenu', event => event.preventDefault());

w = c.width
h = c.height
ts = h/8 //b[x+1][y+1] size


piece_names = ["Pee", "wp", "wn", "wb", "wr", "wq", "wk", "bk", "bq", "br", "bb", "bn", "bp"] //sorteres efter piece number value
var images = []
i = 0
for (let i = 1; i < piece_names.length; i++) {
    images[i] = new Image()
    images[i].src = "./" + piece_names[i] + ".png"
}

console.log(piece_names[-1])

b = []

function clear_board() {
    for (let i = 0; i < 120; i++) {
        if(i < 20 || i > 100 || i % 10 == 9 || i % 10 == 0) {
            b[i] = 7
        }
        else b[i] = 0
        
    }
}
clear_board()
console.log(b)

v = {
    "p": -1,
    P: 1,
    n: -2,
    N: 2,
    b: -3,
    B: 3,
    r: -4,
    R: 4,
    q: -5,
    Q: 5,
    k: -6,
    K: 6
}

v_keys = Object.keys(v)
v_values = Object.values(v)

console.log(v_keys)
code = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"



function FEN_generate(code) {
    clear_board()
    let x = 1
    let y = 9
    for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) == "/") {
            y -= 1
            x = 1
            continue
        }
        else if (isNaN(code.charAt(i))) {
            
            b[y*10+x] = v_values[v_keys.indexOf(code.charAt(i))]

            x += 1
        }
        else {

            x += parseInt(code.charAt(i))

        }

        
    }
}

FEN_generate(code)

console.log(b)

function update() {
    

    for (let i = 0; i < 9*8; i++) {
        let x = i % 9
        let y = Math.floor(i/9)
        if (i%2 == 1) ctx.fillStyle = "brown"
        else ctx.fillStyle = "white"
        ctx.beginPath();
        ctx.rect(x*ts, y*ts, ts, ts);
        ctx.fill();
    }

    for (let i = 0; i < 120; i++) {
        if (b[i] != 7 && b[i] != 0) {
            let x = i % 10
            let y = Math.floor(i/10)
            if (Math.sign(b[i]) == 1) {
                ctx.drawImage(images[b[i]], x*ts - ts, y*ts - 2*ts, ts, ts)
            }
            else {
                ctx.drawImage(images[images.length + b[i]], x*ts - ts, y*ts - 2*ts, ts, ts)

            }
        }
        else {
            
        }
    }
    
}

window.onload = function() {update()}


function mousemove () {

}
function mousedown () {

}
function mouseup () {

}
