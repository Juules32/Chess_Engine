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



find alle moves 1 gang i starten og find fremtidige moves ud fra ændringerne af positionen efter hvert træk for ikke at gentage mange ens trækfremfindinger
til engine at tænke frem er det nemt at trace moves tilbage fordi man bare kan gemme positionen
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
ts = h/8 // tile size


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

v = {
    Hello: "You!",
    P: 1,
    N: 2,
    B: 3,
    R: 4,
    Q: 5,
    K: 6,
    k: -6,
    q: -5,
    r: -4,
    b: -3,
    n: -2,
    p: -1
}

v = [0, "P", "N", "B", "R", "Q", "K", "k", "q", "r", "b", "n", "p"]



code = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"



function FEN_generate(code) {
    let t0 = Date.now()
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
            if(code.charAt(i).toUpperCase() == code.charAt(i)) {
                b[y*10+x] = v.indexOf(code.charAt(i))
            }
            else {
                b[y*10+x] = v.indexOf(code.charAt(i)) - v.length
            }

            x += 1
        }
        else {

            x += parseInt(code.charAt(i))

        }

        
    }
    let t1 = Date.now()
    console.log(t1 - t0)
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
                ctx.drawImage(images[b[i]], x*ts - ts, h - y*ts + ts, ts, ts)
                continue
            }
            else {
                ctx.drawImage(images[images.length + b[i]], x*ts - ts, h - y*ts + ts, ts, ts)
                continue
            }
        }
    }

}

window.onload = function() {update()}

dir = 0

//Array med possible moves for hver brik sorteret efter værdi

function bishop_moves(tile) {
    return 25
}


move_properties = ["Nul!",
[9,10,11,20],
[19,21,8,12,-8,-12,-19,-21],
[tile => {
    tile
}],
[bishop_moves],
[tile => {
    tile
}],

]

move_properties = {
    1: function(tile) {return[tile+9,tile+10,tile+11,tile+20]},
    2: function(tile) {return [tile+19,tile+21,tile+8,tile+12,tile-8,tile-12,tile-19,tile-21]},
    3: function(tile) {return tile},
    4: function(tile) {return tile},
    5: function(tile) {return tile},
    6: function(tile) {return [tile+9,tile+10,tile+11,tile-1,tile+1,tile-9,tile-10,tile-11]},
}

console.log(move_properties[3](2))


function pseudo_moves(tile) {
    let type = Math.abs(b[tile])
    dir = Math.sign(tile)
    return move_properties[type](tile)
}
console.log(pseudo_moves(31))


function unchecked_moves(moves) {

}

function checked_moves(moves) {

}

function all_moves(color) {

}


function mouse_to_b(mouse_x, mouse_y) {
    return Math.ceil((h-(mouse_y - canvas_boundary.top))/ts)*10 + Math.ceil((mouse_x - canvas_boundary.left)/ts) + 10
}

console.log(mouse_to_b(43,43))

mouse_down = false
var p

function mousemove (event) {
    
    mouse_x = Math.floor((event.x - canvas_boundary.left)/ts) 
    mouse_y = Math.floor((event.y - canvas_boundary.top)/ts)
    let xy = mouse_to_b(event.x, event.y)

    update()

    ctx.fillText(event.x + ", " + event.y, 10, 50);
    if(mouse_down && b[down_xy] && b[down_xy] != 7) {
        
        /* Moves dots
                for (let i = 0; i < active_piece_moves.length; i++) {
                    ctx.fillStyle = "gray"
                    ctx.beginPath();
                    ctx.arc(active_piece_moves[i][0]*ts - ts/2, h - active_piece_moves[i][1]*ts + ts/2, ts/ 5, 0, 7);
                    ctx.fill();
                
            }*/
            if (down_x % 2 == 0) p = 1
            else p = 0
            if ((down_y + p) % 2 == 1) ctx.fillStyle = "white"
            else ctx.fillStyle = "brown"
            ctx.beginPath();
            ctx.rect(down_x*ts, down_y*ts, ts, ts)
            ctx.fill();
            ctx.drawImage(images.slice(b[down_xy])[0],event.x - canvas_boundary.left - ts/2,event.y - canvas_boundary.top - ts/2,ts,ts)
    }
}
function mousedown (event) {
    
    mouse_down = true

    down_x = mouse_x
    down_y = mouse_y

    down_xy = mouse_to_b(event.x,event.y)

    
}
function mouseup () {
    mouse_down = false

}

