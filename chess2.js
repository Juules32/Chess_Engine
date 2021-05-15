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



Empty space queen side castle

Swap side ?

*/

//Defining canvas
c = document.getElementById("visuals")
ctx = c.getContext("2d");
c.width = 800
c.height = 400

//Event listeners
c.onmousemove = mousemove
c.onmousedown = mousedown
document.onmouseup = mouseup

//Finds canvas' offset from (0, 0) on website
canvas_boundary = c.getBoundingClientRect()

//Disables right click menu in canvas
c.addEventListener('contextmenu', event => event.preventDefault());

const w = c.width
const h = c.height
const ts = h/8 // tile size


mm = [] //Match Moves

//Piece names sorteres efter værdi
piece_names = [null, "wp", "wn", "wb", "wr", "wq", "wk", "bk", "bq", "br", "bb", "bn", "bp"]
var images = []
for (let i = 1; i < piece_names.length; i++) {
    images[i] = new Image()
    images[i].src = "./" + piece_names[i] + ".png"
}

b = [] //Board
f = [] //First move

function clear_board() {
    for (let i = 0; i < 120; i++) {
        if(i < 20 || i > 100 || i % 10 == 9 || i % 10 == 0) {
            b[i] = 7
            f[i] = 7
        }
        else {
            b[i] = 0
            f[i] = 0
        }
    }
}

v = {
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

code = "rnbqkbnr/pPpppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

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
            if(code.charAt(i).toUpperCase() == code.charAt(i)) {
                b[y*10+x] = v[code.charAt(i)]
            }
            else {
                b[y*10+x] = v[code.charAt(i)]
            }
            if(Math.sign(b[y*10+x]) == 1 && y*10+x >= 21 && y*10+x <= 38) {
                f[y*10+x] = 1
            }
            else if (Math.sign(b[y*10+x]) == -1 && y*10+x >= 81 && y*10+x <= 98) {
                f[y*10+x] = 1
            }
            x += 1
        }
        else {

            x += parseInt(code.charAt(i))

        }

        
    }
}

FEN_generate(code)

function update() {
    //Draws Chess tiles
    for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
            if((file+rank) % 2 != 0) {
                ctx.fillStyle = "brown"
            }
            else ctx.fillStyle = "white"
            ctx.beginPath();
            ctx.rect(rank*ts, file*ts, ts, ts);
            ctx.fill();
        }
    }

    //Draws Pieces
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

    //Draws test stuff
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.rect(ts*8, 0,  w, h);
    ctx.fill();
    for (let i = 0; i < mm.length; i++) {
        ctx.font = "15px Arial";
        ctx.fillStyle = "blue"
        ctx.fillText(mm[mm.length-1-i], 420, 50+i*15)
    }
    for (let i = 0; i < f.length; i++) {
        let x = b_to_x(i)
        let y = b_to_y(i)
        
        if(b[i] == 7) {
            continue
        }

        if (!b[i]) {
            ctx.fillStyle = "green"
            
        }
        else {
            ctx.fillStyle = "yellow"
            
        }
        
        if (f[i] == 1) {
            ctx.fillStyle = "purple"
            
        }
        ctx.beginPath();
        ctx.rect(400+x*0.2,150+y*0.2,10,10);
        ctx.fill();
        
    }
    ctx.beginPath();
    ctx.rect(400,300,100,100);
    ctx.fill();
}

//Updates board when window has loaded
window.onload = function() {update()}

//Knight and King moves
function NK_moves(t, moves, color) {
    let unchecked_moves = []
    moves.forEach(dir => {
        let move = t + dir
        if(b[move] != 7 && (b[move] == 0 || Math.sign(b[move]) != color)) {
            unchecked_moves.push(move)
        }
    })
    return unchecked_moves
}

//Pawn moves
function P_moves(t, color) {
    let unchecked_moves = []
    for (let i = -1; i < 2; i += 2) {
        if(b[t+(10+i)*color] && Math.sign(b[t+(10+i)*color]) != color && b[t+(10+i)*color] != 7) {
            unchecked_moves.push(t+(10+i)*color)
        }
    }
    if(!b[t+(10*color)]) {
        unchecked_moves.push(t+(10*color))
        if (f[t] && !b[t+(20*color)]) {
            unchecked_moves.push(t+(20*color))
        }
    }
    
    return unchecked_moves
}

//Bishop, Rook and Queen moves
function BRQ_moves(t, directions, color) {
    let unchecked_moves = []
    directions.forEach(dir => {
        let i = 0
        while (true) {
            i += 1
            let dir_t = t + i*dir
            if(b[dir_t] == 0) {
                unchecked_moves.push(dir_t)
                continue
            } 
            else if (b[dir_t] == 7 || Math.sign(b[dir_t]) == color) break
            else if (Math.sign(b[dir_t]) != color) {
                unchecked_moves.push(dir_t)
                break
            }
        }
    })
    return unchecked_moves
}

move_properties = {
    1: function(t, color) {return P_moves(t, color)},
    2: function(t, color) {return NK_moves(t, [19, 21, 8, 12, -8, -12, -19, -21], color)},
    3: function(t, color) {return BRQ_moves(t, [9, 11, -9, -11], color)},
    4: function(t, color) {return BRQ_moves(t, [10, -1, 1, -10], color)},
    5: function(t, color) {return BRQ_moves(t, [9, 11, -9, -11, 10, -1, 1, -10], color)},
    6: function(t, color) {return NK_moves(t, [9, 10, 11, -1, 1, -9, -10, -11], color)},
}


function move(t, move, promotion = 0) {
    let t0 = Date.now()
    let mover = checked_moves(t)
    let type_of_move
    if (!mover[0]) {
        return console.log("Illegal move")
    }
    for (let i = 0; i < mover.length + 1; i++) {
        if (mover[i][1] == move) {
            type_of_move = mover[i+promotion][5]
            mm.push(mover[i+promotion])
            console.log(mover[i+promotion])
            break
        }
        else if (i == mover.length - 1) {
            return console.log("Illegal move")
        }
    }
    //normal move
    if(!type_of_move) {
        b[move] = b[t]
        b[t] = 0
        f[t] = 0
        f[move] = 0
    }
    //Right castle
    else if (type_of_move == 1) {
        b[t+1] = b[t+3]
        b[t+3] = 0
        f[t+1] = 0
        f[t+3] = 0
        b[move] = b[t]
        b[t] = 0
        f[move] = 0
        f[t] = 0
    }
    //Left castle
    else if (type_of_move == -1) {
        b[t-1] = b[t-4]
        b[t-4] = 0
        f[t-1] = 0
        f[t-4] = 0
        b[move] = b[t]
        b[t] = 0
        f[move] = 0
        f[t] = 0
    }
    else if(Math.abs(type_of_move) == 6) {
        b[move] = b[t]
        b[t] = 0
        b[t+Math.sign(type_of_move)] = 0
    }
    //Promotion
    else { 
        b[move] = type_of_move
        b[t] = 0
        f[t] = 0
        f[move] = 0
    }
    let t1 = Date.now()
    console.log(t1-t0)

    
}


function pseudo_moves(t) {
    let type = Math.abs(b[t])
    let color = Math.sign(b[t])
    return move_properties[type](t, color)
}

function all_pseudo_moves(color) {
    let total_moves = []
    for (let i = 0; i < 120; i++) {
        let piece = b[i]
        if (piece != 0 && piece != 7 && Math.sign(piece) == color) {
            total_moves = total_moves.concat(pseudo_moves(i))
        }
    }
    return total_moves
}

pseudo_moves(82)

function t_is_hit(t, color) {
    for (let i = 0; i < 120; i++) {
        let piece = b[i]
        if (piece != 0 && piece != 7 && Math.sign(piece) == color) {
            if(pseudo_moves(i).includes(t)) {
                return 1
            }
        }
        
    }
    return 0
}


function checked_moves(t) {
    let moves = pseudo_moves(t)
    let color = Math.sign(b[t])
    let illegal_moves = []
    let value = b[t]

    moves.forEach(move => {
        let temp = b[move]
        b[move] = value
        b[t] = 0
        
        if (t_is_hit(b.indexOf(6*color), color*-1)) {
                illegal_moves.push(move)
            
                    b[move] = temp
                    b[t] = value
                    return
        }
        
        b[move] = temp
        b[t] = value
        //first move er ligegyldigt (?)
    })
    
    moves = moves.filter(move => !illegal_moves.includes(move))

    let true_moves = []
    moves.forEach(move => {
        if (Math.abs(b[t]) == 1 && (Math.floor(move/10)) == 5.5 + 3.5*color) {
            for (let i = 2; i <= 5; i++) {

                true_moves.push([t, move, b[t], b[move], f[t], i*color])
            }
                
        }
    
        
        
        
        else {
            true_moves.push([t, move, b[t], b[move], f[t], 0])
        }
    


    })
    if (Math.abs(value) == 1) {
        if (mm.length) {
            if (Math.floor(mm[mm.length - 1][1]/10) == Math.floor(t/10) && mm[mm.length - 1][0] == mm[mm.length - 1][1] + 20*color && mm[mm.length - 1][2] == color*-1) {
                if((mm[mm.length - 1][0] % 10) - 1 == t % 10) {
                    b[t+10*color+1] = b[t]
                    b[t] = 0
                    b[t+1] = 0
                    if(!t_is_hit(b.indexOf(6*color), color*-1)) {
                        true_moves.push([t, t+10*color+1, color, 0, f[t], +6])
                    }
                    b[t] = b[t+10*color+1]
                    b[t+10*color+1] = 0
                    b[t+1] = color*-1
                }
                else if((mm[mm.length - 1][0] % 10) + 1 == t % 10) {
                    b[t+10*color-1] = b[t]
                    b[t] = 0
                    b[t-1] = 0
                    if(!t_is_hit(b.indexOf(6*color), color*-1)) {
                        true_moves.push([t, t+10*color-1, color, 0, f[t], -6])
                    }
                    b[t] = b[t+10*color-1]
                    b[t+10*color-1] = 0
                    b[t-1] = color*-1
                }
                
                
            }
            
        }
    }
    if(b.indexOf(6*color) == t && f[t] && !t_is_hit(t, color*-1)) {
        if (f[t+3] && !b[t+1] && !b[t+2]) {
            if (!t_is_hit(t+1, color*-1) && !t_is_hit(t+2, color*-1) && b[t+3+10*color] != color*-1) {
                    true_moves.push([t, t+2, b[t], b[t+2], f[t], 1])
            }
            
        }
        if (f[t-4] && !b[t-1] && !b[t-2] && !b[t-3]) {
            if (!t_is_hit(t-1, color*-1) && !t_is_hit(t-2, color*-1) && b[t-3+10*color] != color*-1) {
                    true_moves.push([t, t-2, b[t], b[t-2], f[t], -1]) 
            }
        }
        

    } 
    return true_moves
}







function mouse_to_b(mouse_x, mouse_y) {
    return Math.ceil((h-(mouse_y - canvas_boundary.top))/ts)*10 + Math.ceil((mouse_x - canvas_boundary.left)/ts) + 10
}

function b_to_x(t) {
    return (t % 10)*ts
}

function b_to_y(t) {
    return h-Math.floor(t/10)*ts
}

mouse_down = false
var xy
var p

var will_update = true

var promotion_x
var promotion_y

function mousemove (event) {
    mouse_x = Math.floor((event.x - canvas_boundary.left)/ts)*ts 
    mouse_y = Math.floor((event.y - canvas_boundary.top)/ts)*ts

    if(will_update) {
        xy = mouse_to_b(event.x, event.y)
        

        update()
        ctx.font = "30px Arial";
        ctx.fillStyle = "blue"
        ctx.fillText(mouse_to_b(event.x, event.y) + ", " + mouse_x + ", " + mouse_y, event.x, event.y);

        if(mouse_down) {
                for (let i = 0; i < checked_moves(down_xy).length; i++) {
                    ctx.fillStyle = "gray"
                    ctx.beginPath();
                    ctx.arc(b_to_x(checked_moves(down_xy)[i][1]) - ts/2, b_to_y(checked_moves(down_xy)[i][1]) + 3*ts/2, ts/ 5, 0, 7);
                    ctx.fill();
                }
                if (down_x/ts % 2 == 0) p = 1
                else p = 0
                if ((down_y/ts + p) % 2 == 1) ctx.fillStyle = "white"
                else ctx.fillStyle = "brown"
                ctx.beginPath();
                ctx.rect(down_x, down_y, ts, ts)
                ctx.fill();
                ctx.drawImage(images.slice(b[down_xy])[0],event.x - canvas_boundary.left - ts/2,event.y - canvas_boundary.top - ts/2,ts,ts)
        }
    }
}
function mousedown (event) {
    if (will_update) {
        down_x = mouse_x
        down_y = mouse_y
    
        down_xy = mouse_to_b(event.x,event.y)
    
        if(b[down_xy] && b[down_xy] != 7) {
            mouse_down = true
        }

        if((mouse_x == 400 || mouse_x == 450) && mouse_y > 250) {
            unmake_lm()
        }
    }
    else {
        let color = Math.sign(b[down_xy])
        
        if(mouse_x == promotion_x) {
            for (let i = 0; i < 4; i++) {
                if (mouse_y == promotion_y + ts*color*i) {
                    move(down_xy,xy, 5-i-2)
                    b[xy] = (5-i)*color
                    
                }
            }
            

            
        }


        will_update = true
        update()
    }

   
}


function mouseup () {
    if(will_update) {


        if(mouse_down) {
                if(xy != down_xy) {
                    let promotion_piece = 0
                    let color = Math.sign(b[down_xy])

                    let x = xy % 10
                    let y = Math.floor(xy/10) - 1
                    let down_y = Math.floor(down_xy/10) - 1
                    if (Math.abs(b[down_xy]) == 1 && y == 4.5+3.5*color && down_y == 4.5+2.5*color) {
                        will_update = false
                        promotion_y = mouse_y
                        promotion_x = mouse_x
                        

                        
                        if(color == 1) {
                            ctx.fillStyle = "grey"
                            ctx.beginPath();
                            ctx.rect(mouse_x, mouse_y, ts, ts*4)
                            ctx.fill();
                            for (let i = 2; i < 6; i++) {
                                ctx.drawImage(images[i], mouse_x, (5-i)*ts, ts, ts)
                                
                            }
                        }
                        else {
                            ctx.fillStyle = "grey"
                            ctx.beginPath();
                            ctx.rect(mouse_x, mouse_y-ts*3, ts, ts*4)
                            ctx.fill();
                            for (let i = 2; i < 6; i++) {
                                ctx.drawImage(images[images.length-i], mouse_x, (5-i*color)*ts-3*ts, ts, ts)
                                
                            }
                        }

                    }

                    else {
                        move(down_xy, xy)
                    }

                    


                }
            
        }
        mouse_down = false
    }
}


function all_legal_moves(color) {
    let all_moves = []
    for (let i = 0; i < b.length; i++) {
        let tile = b[i]
        if (tile && tile != 7 && Math.sign(tile) == color) {
            all_moves = all_moves.concat(checked_moves(i))
        }
        
    }
    return all_moves
}

function unmake_lm() {
    let lm = mm[mm.length-1] //last move
    console.log(lm)

    b[lm[0]] = lm[2]
    b[lm[1]] = lm[3]
    f[lm[0]] = lm[4]
    if(lm[3]) f[lm[1]] = 1

    if(Math.abs(lm[5]) == 1) {
        b[Math.floor(lm[0]/10)*10+4.5+3.5*lm[5]] = b[lm[0]+lm[5]]
        b[lm[0]+lm[5]] = 0
        f[Math.floor(lm[0]/10)*10+4.5+3.5*lm[5]] = 1
    }

    else if(Math.abs(lm[5]) == 6) {
        b[lm[0]+Math.sign(lm[5])] = lm[2]*-1
    }
    mm.pop()
    update()
}


function movegen(depth) {
    if (depth == 0) {
        return 1
    }

    let legal_moves
    if(!mm.length) {
        legal_moves = all_legal_moves(1)
    }
    else {
        legal_moves = all_legal_moves(Math.sign(mm[mm.length-1][2])*-1)
    }
    console.log(legal_moves)
    let numPositions = 0


    numPositions += movegen(depth-1)






    return numPositions
}

move(82,93)

unmake_lm()



