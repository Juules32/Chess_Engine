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

sorter moves i all_legal_moves efter vigtighed for hurtigere at finde de gode moves

lav funktion, der vælger trækket
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

code = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R"

code = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8"

code = "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1"

code = "k7/P7/K7/PP/8/8/8/8"
code = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

dev_mode = true
function get_dev() {
    if (dev_mode) dev_mode = false
    else dev_mode = true
    update()
}

edit = false
function get_edit() {
    if (edit) edit = false
    else edit = true
}

function FEN_generate(code) {
    mm = []
    console.log(code)
    clear_board()
    let x = 1
    let y = 9
    for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) == " ") {
            break
        }
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
            if(b[y*10+x] == 1 && y*10+x >= 31 && y*10+x <= 38) {
                f[y*10+x] = 1
            }
            else if (b[y*10+x] == -1 && y*10+x >= 81 && y*10+x <= 88) {
                f[y*10+x] = 1
            }
            
            x += 1
        }
        else {

            x += parseInt(code.charAt(i))

        }

        
    }

    //Afgør, om konger har rykket
    for (let i = -1; i < 2; i = i + 2) {
        if (b[60-35*i] == 6*i) {
            f[60-35*i] = 1
        }
    }

    //Afgør, om tårne har rykket
    for (let i = -1; i < 2; i = i + 2) {
        if (b[56-35*i] == 4*i) {
            f[56-35*i] = 1
        }
        if (b[63-35*i] == 4*i) {
            f[63-35*i] = 1
        }
    }

    //Opdaterer med det samme, så man kan se brikkerne
    update()
}

FEN_generate(document.getElementById("FEN_input").value)

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

    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.rect(ts*8, 0,  w, h);
    ctx.fill();
    
    if(dev_mode) dev_tools()
    
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


function move(m) {
    let type_of_move
    mm.push(m)
    
    //normal move
    if(!m[5]) {
        b[m[1]] = b[m[0]]
        b[m[0]] = 0
        f[m[0]] = 0
        f[m[1]] = 0
        return
    }
    //Right castle
    if (m[5] == 1) {
        b[m[0]+1] = b[m[0]+3]
        b[m[0]+3] = 0
        f[m[0]+1] = 0
        f[m[0]+3] = 0
        b[m[1]] = b[m[0]]
        b[m[0]] = 0
        f[m[1]] = 0
        f[m[0]] = 0
        return
    }
    //Left castle
    if (m[5] == -1) {
        b[m[0]-1] = b[m[0]-4]
        b[m[0]-4] = 0
        f[m[0]-1] = 0
        f[m[0]-4] = 0
        b[m[1]] = b[m[0]]
        b[m[0]] = 0
        f[m[1]] = 0
        f[m[0]] = 0
        return
    }
    if(Math.abs(m[5]) == 6) {
        b[m[1]] = b[m[0]]
        b[m[0]] = 0
        b[m[0]+Math.sign(m[5])] = 0
        return
    }
    //Promotion
    b[m[1]] = m[5]
    b[m[0]] = 0
    f[m[1]] = 0
    f[m[0]] = 0
    

    
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

                true_moves.push([t, move, b[t], b[move], f[t], i*color, f[move]])
            }
                
        }
    
        
        
        
        else {
            true_moves.push([t, move, b[t], b[move], f[t], 0, f[move]])
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
    if(b.indexOf(6*color) == t && f[t] && !t_is_hit(t, color*-1) && b[t+10*color] != color*-1) {
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
        ctx.fillText(xy, event.x-canvas_boundary.left, event.y - canvas_boundary.top);

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
                    console.log([down_xy, xy, b[down_xy], b[xy], f[down_xy], 5-i-2])
                    move([down_xy, xy, b[down_xy], b[xy], f[down_xy], (5-i)*color, f[xy]])
                }
            }
            

            
        }


        will_update = true
    }
    if(edit) {
        b[xy] = parseInt(document.getElementById('Edit_piece').value)
        f[xy] = 0
    }
    update()
   
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
                    if (Math.abs(b[down_xy]) == 1 && Math.floor(xy/10) == 5.5+3.5*color && down_y == 4.5+2.5*color) {
                        for (let i = 0; i < checked_moves(down_xy).length; i++) {
                            if (checked_moves(down_xy)[i].includes(xy)) {
                                console.log("pe")
                                break
                            }
                            if (i == checked_moves(down_xy).length - 1) {
                                mouse_down = false
                                return
                            }
                        }
                    
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
                        for (let i = 0; i < checked_moves(down_xy).length; i++) {
                            if (checked_moves(down_xy)[i][1] == xy) {
                                move(checked_moves(down_xy)[i])
                                mouse_down = false
                                return
                            }
                            
                        }
                        console.log("Illegal move!")
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

    b[lm[0]] = lm[2]
    b[lm[1]] = lm[3]
    f[lm[0]] = lm[4]
    f[lm[1]] = lm[6]

    if(Math.abs(lm[5]) == 1) {
        b[Math.floor(lm[0]/10)*10+4.5+3.5*lm[5]] = b[lm[0]+lm[5]]
        b[lm[0]+lm[5]] = 0
        f[Math.floor(lm[0]/10)*10+4.5+3.5*lm[5]] = 1
    }

    else if(Math.abs(lm[5]) == 6) {
        b[lm[0]+Math.sign(lm[5])] = lm[2]*-1
    }
    mm.pop()
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
    let numPositions = 0

    

    
        legal_moves.forEach(m => {

            move(m)
            numPositions += movegen(depth-1)
            unmake_lm()

        })
    
    return numPositions
}

/*let t0 = Date.now()
console.log(movegen(5))
let t1 = Date.now()
console.log(t1-t0)*/



function evaluate() {
    let evaluation = 0
    b.forEach(tile => {
        if (tile != 7 && tile) {
            let tile_abs = Math.abs(tile)
            let color = Math.sign(tile)
            if(tile_abs == 1) {
                evaluation += tile
            }
            else if(tile_abs == 2 || tile_abs == 3) {
                evaluation += 3*color
            }
            else if (tile_abs == 4) {
                evaluation += 5*color
            }
            else {
                evaluation += 9*color
            }
        }
    })
    return evaluation
}


function minimax(depth, alpha, beta, maximizing_player) {
    if (depth == 0) {
        return evaluate()
    }
    if((maximizing_player == 1 || maximizing_player == -1) && !all_legal_moves(maximizing_player).length) {
        if (t_is_hit(b.indexOf(6*maximizing_player), maximizing_player*-1)) { //ÆNDR
            console.log("Checkmate!")
            return -Infinity
        }
        console.log("Stalemate!")
        return 0
    }

    if (maximizing_player == 1) {
        for (let i = 0; i < all_legal_moves(maximizing_player).length; i++) {
            let m = all_legal_moves(maximizing_player)[i]
            
        
            move(m)

            evaluation = minimax(depth -1, alpha, beta, -1)

            unmake_lm()
            alpha = Math.max(alpha, evaluation)
            if (beta <= alpha) {
                break
            }
        }
        return alpha

    }
    else if (maximizing_player == -1) {
        for (let i = 0; i < all_legal_moves(maximizing_player).length; i++) {
            let m = all_legal_moves(maximizing_player)[i]
            move(m)

            evaluation = minimax(depth -1, alpha, beta, 1)
            unmake_lm()
            beta = Math.min(beta, evaluation)
            if(beta <= alpha) {
                break
            }
        }
        return beta

    }
}

t0 = Date.now()
console.log(minimax(4,-Infinity, Infinity, 1))
t1 = Date.now()
console.log(t1-t0)

function best_move(depth, color) {
    let moves = all_legal_moves(color)
    let current_best_evaluation = Infinity*color*-1
    
    let best_moves = []
    for (let i = 0; i < moves.length; i++) {
        move(moves[i])
        let test_evaluation = minimax(depth-1, -Infinity, Infinity, color*-1)
        if(color == 1) {

            if (test_evaluation >= current_best_evaluation) {
                current_best_evaluation = test_evaluation
                best_moves.push(i)
                console.log(moves[i], current_best_evaluation)

            }
        }
        else {

            if (test_evaluation <= current_best_evaluation) {
                current_best_evaluation = test_evaluation
                best_moves.push(i)
                console.log(moves[i], current_best_evaluation)

            }
        }
        unmake_lm()        
    }
    return best_moves //Kan ændres tilbage til bare det bedste træk, men prøv evt. at kunne bruge best moves, når man leder efter først 1 depth, så 2 etc.
    7adad // brug best_moves som parameter til iterativ?
}


function dev_tools() {
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
    ctx.font = "25px Arial";


    for (let i = 0; i < mm.length; i++) {
        ctx.font = "15px Arial";
        ctx.fillStyle = "blue"
        ctx.fillText(mm[mm.length-1-i], 420, 50+i*15)
    }
    ctx.fillText(evaluate(), 420, 250)
}

