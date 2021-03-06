/*
Useful FEN-strings:

r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R
8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8
r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1
k7/P7/K7/PP/8/8/8/8
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
2bqkbn1/2pppp2/np2N3/r3P1p1/p2N2B1/5Q2/PPPPKPP1/RNB2r2 w KQkq - 0 1
*/

//Defining canvas
c = document.getElementById("visuals")
ctx = c.getContext("2d");
c.height = 550
c.width = c.height

const h = c.height //canvas height is constant
const ts = h/8 // tile size

//Event listeners
c.onmousemove = mousemove
c.onmousedown = mousedown
document.onmouseup = mouseup

//Finds canvas' offset from (0, 0) on website
canvas_boundary = c.getBoundingClientRect()

//Disables right click menu in canvas
c.addEventListener('contextmenu', event => event.preventDefault());

//Piece names sorted by value
piece_names = [null, "wp", "wn", "wb", "wr", "wq", "wk", "bk", "bq", "br", "bb", "bn", "bp"]
var images = []
for (let i = 1; i < piece_names.length; i++) {
    images[i] = new Image()
    images[i].src = "./" + piece_names[i] + ".png"
}

const board = new Image()
board.src = "./board.png"

var mm = [] //Match Moves
var b = [] //Board
var f = [] //First move

//Developer options are not shown by default
document.getElementById('dev_buttons').style.display = 'none'

//Turns developer mode on/off
function get_dev() {
    if (document.getElementById('dev_buttons').style.display == 'none') {
        document.getElementById('dev_buttons').style.display = 'block'
        c.width = 2*h
    } 
    else {
        document.getElementById('dev_buttons').style.display = 'none'
        c.width = h
    }
    update()
}

//Turns board editor mode on/off
edit = false
function get_edit() {
    if (edit) edit = false
    else edit = true
}

//Piece values
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

//Cleans the board
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

//Creates position from FEN-string
function FEN_generate(code) {
    mm = []
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
        else x += parseInt(code.charAt(i))
    }

    //Decides if king has moved
    for (let i = -1; i < 2; i = i + 2) {
        if (b[60-35*i] == 6*i) {
            f[60-35*i] = 1
        }
    }

    //Decides if rooks have moved
    for (let i = -1; i < 2; i = i + 2) {
        if (b[56-35*i] == 4*i) {
            f[56-35*i] = 1
        }
        if (b[63-35*i] == 4*i) {
            f[63-35*i] = 1
        }
    }

    //Updates the board
    update()
}

var moving_square
var computer_playing = true

function update() {
    //Updates canvas boundary
    canvas_boundary = c.getBoundingClientRect()

    //Draws Chess board
    ctx.drawImage(board,0,0, h, h)

    //Draws Pieces
    for (let i = 0; i < 120; i++) {
        if (b[i] != 7 && b[i] != 0) {
            let x = i % 10
            let y = Math.floor(i/10)
            if(i != moving_square)
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

    //Dev visuals
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.rect(h, 200,  h, h);
    ctx.fill();
    for (let i = 0; i < f.length; i++) {
        let x = b_to_x(i)
        let y = b_to_y(i)
        if(b[i] == 7) continue
        if (!b[i]) ctx.fillStyle = "green"
        else ctx.fillStyle = "yellow"
        if (f[i] == 1) ctx.fillStyle = "purple"
        ctx.beginPath();
        ctx.rect(h+x*0.2,300+y*0.2,h*0.02, h*0.02);
        ctx.fill();
    }
    ctx.font = "15px Arial";
    ctx.fillStyle = "blue"
    for (let i = 0; i < mm.length; i++) {
        ctx.fillText(mm[mm.length-1-i], h*1.3, h*0.6+i*15)
    }

    //Displays Checkmate or Stalemate
    if (!all_legal_moves(player_to_move()).length) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "blue"
        if (t_is_hit(b.indexOf(6*player_to_move()), -player_to_move())) {
            let word
            if(player_to_move() == 1) word = "Black"
            else word = "White"
            ctx.fillText(word + " wins!", h/2-50, h/2-10);
        }
        else ctx.fillText("Stalemate!", h/2-50, h/2-10);
        ctx.font = "15px Arial";
        ctx.fillStyle = "blue"
    }
}

//Updates board when window has loaded
window.onload = function() {update()}

//Each type of piece's inherent move properties
move_properties = {
    1: function(t, color) {return P_moves(t, color)},
    2: function(t, color) {return NK_moves(t, [19, 21, 8, 12, -8, -12, -19, -21], color)},
    3: function(t, color) {return BRQ_moves(t, [9, 11, -9, -11], color)},
    4: function(t, color) {return BRQ_moves(t, [10, -1, 1, -10], color)},
    5: function(t, color) {return BRQ_moves(t, [9, 11, -9, -11, 10, -1, 1, -10], color)},
    6: function(t, color) {return NK_moves(t, [9, 10, 11, -1, 1, -9, -10, -11], color)},
}

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

//Pseudo moves is a piece's moves without consideration for discovered checks
function pseudo_moves(t, type = Math.abs(b[t]), color = Math.sign(b[t])) {
    //Gets move properties from move_properties
    return move_properties[type](t, color)
}

//Lists all pseudo moves
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

//Determines if a tile is hit by a color or not
function t_is_hit(t, color) {
    for (let i = 0; i < 120; i++) {
        let piece = b[i]
        if (piece != 0 && piece != 7 && Math.sign(piece) == color) {
            if(pseudo_moves(i).includes(t)) return 1
        }
    }
    return 0
}

//All moves of a piece, taking discovered checks into account
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
    })
    let true_moves = []
    moves.filter(move => !illegal_moves.includes(move)).forEach(move => {
        if (Math.abs(b[t]) == 1 && (Math.floor(move/10)) == 5.5 + 3.5*color) {
            for (let i = 2; i <= 5; i++) {
                true_moves.push([t, move, b[t], b[move], f[t], i*color, f[move]])
            }
        }
        else true_moves.push([t, move, b[t], b[move], f[t], 0, f[move]])
    })

    //En pessant
    if (Math.abs(value) == 1) {
        if (mm.length) {
            if (Math.floor(mm[mm.length - 1][1]/10) == Math.floor(t/10) && 
mm[mm.length - 1][0] == mm[mm.length - 1][1] + 20*color && mm[mm.length - 1][2] == color*-1) {
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

    //Castling
    if(b.indexOf(6*color) == t && f[t] && !t_is_hit(t, color*-1) && b[t+10*color] != color*-1) {
        if (f[t+3] && !b[t+1] && !b[t+2]) {
            if (!t_is_hit(t+1, color*-1) && !t_is_hit(t+2, color*-1) && b[t+3+10*color] != color*-1) {
                true_moves.push([t, t+2, b[t], b[t+2], f[t], 1, 0])
            }
        }
        if (f[t-4] && !b[t-1] && !b[t-2] && !b[t-3]) {
            if (!t_is_hit(t-1, color*-1) && !t_is_hit(t-2, color*-1) && b[t-3+10*color] != color*-1) {
                true_moves.push([t, t-2, b[t], b[t-2], f[t], -1, 0]) 
            }
        }
    } 
    return true_moves
}

//For moving pieces
function move(m) {
    if(m == undefined) return
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
    //En Pessant
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

//Converts mouse positions to tile on board
function mouse_to_b(mouse_x, mouse_y) {
    return Math.ceil((h-(mouse_y - canvas_boundary.top))/ts)*10 + Math.ceil((mouse_x - canvas_boundary.left)/ts) + 10
}

//Converts tile to x coordinate
function b_to_x(t) {
    return (t % 10)*ts
}

//Converts tile to y coordinate
function b_to_y(t) {
    return h-Math.floor(t/10)*ts
}

//Lists all legal moves
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

//Undoes the last move played
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

//Determines what player it is to move
function player_to_move() {
    let player_to_move
    if (!mm.length) player_to_move = 1
    else if(Math.sign(mm[mm.length-1][2]) == 1) player_to_move = -1
    else player_to_move = 1
    return player_to_move
}

//Interactivity variables
var mouse_down = false
var will_update = true
var mouse_x
var mouse_y
var down_x
var down_y
var promotion_x
var promotion_y
var xy
var down_xy

//Converts tile number to chess notation
function tile_to_letternumber(tile) {
    return String.fromCharCode(96+(tile % 10)) + (Math.floor(tile/10)-1).toString()
}

//What happens when the mouse moves
function mousemove (event) {
    mouse_x = Math.floor((event.x - canvas_boundary.left)/ts)*ts 
    mouse_y = Math.floor((event.y - canvas_boundary.top)/ts)*ts
    if(will_update) {
        xy = mouse_to_b(event.x, event.y)
        update()
        if(mouse_down) {
            for (let i = 0; i < checked_moves(down_xy).length; i++) {
                ctx.fillStyle = "gray"
                ctx.beginPath();
                ctx.arc(b_to_x(checked_moves(down_xy)[i][1]) - ts/2, b_to_y(checked_moves(down_xy)[i][1]) + 3*ts/2, ts/ 5, 0, 7);
                ctx.fill();
            }
            moving_square = down_xy
            ctx.drawImage(images.slice(b[down_xy])[0],event.x - canvas_boundary.left - ts/2,event.y - canvas_boundary.top - ts/2,ts,ts)
        }
        else {
            moving_square = 100
            update()
        }
    }
    if (event.x-canvas_boundary.left < h && document.getElementById('dev_buttons').style.display == 'block') {
        ctx.font = "30px Arial";
        ctx.fillStyle = "blue"
        ctx.fillText(tile_to_letternumber(xy), event.x-canvas_boundary.left - 33, event.y - canvas_boundary.top);
    }
}

//What happens when mouse is pressed
function mousedown (event) {
    if (will_update) {
        down_x = mouse_x
        down_y = mouse_y
        down_xy = mouse_to_b(event.x,event.y)
        
        if(b[down_xy] && b[down_xy] != 7 && Math.sign(b[down_xy]) == player_to_move()) mouse_down = true
    }
    else {
        let color = Math.sign(b[down_xy])
        if(mouse_x == promotion_x) {
            for (let i = 0; i < 4; i++) {
                if (mouse_y == promotion_y + ts*color*i) {
                    move([down_xy, xy, b[down_xy], b[xy], f[down_xy], (5-i)*color, f[xy]])
                    if(computer_playing && player_to_move() == -1) computer_move(document.getElementById('Average_time').value)
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

//What happens when mouse button is lifted
function mouseup () {
    if(will_update) {
        if(mouse_down) {
            if(xy != down_xy) {
                let color = Math.sign(b[down_xy])
                if (Math.abs(b[down_xy]) == 1 && Math.floor(xy/10) == 5.5+3.5*color) {
                    for (let i = 0; i < checked_moves(down_xy).length; i++) {
                        if (checked_moves(down_xy)[i].includes(xy)) {
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
                            if(computer_playing && player_to_move() == -1) {
                                setTimeout(() =>
                                    computer_move(document.getElementById('Average_time').value)
                                , 200)
                            }
                            return
                        }
                    }
                    console.log("Illegal move!")
                }
                if(computer_playing && player_to_move() == -1) {
                    setTimeout(() =>
                        computer_move(document.getElementById('Average_time').value)
                    , 200)
                }
            }
        }
        mouse_down = false
    }
}

//Finds all possible board states depth moves into the game
function movegen(depth) {
    if (depth == 0) return 1
    let legal_moves
    if(!mm.length) legal_moves = all_legal_moves(1)
    else legal_moves = all_legal_moves(Math.sign(mm[mm.length-1][2])*-1)
    let numPositions = 0
        legal_moves.forEach(m => {
            move(m)
            numPositions += movegen(depth-1)
            unmake_lm()
        })
    return numPositions
}

//Gets value of any piece
function get_piece_value(piece) {
    if(piece > 0) {
        if(piece == 1) return piece
        else if(piece == 2 || piece == 3) return 3
        else if (piece == 4) return 5
        else return 9
    }        
    else {
        if(piece == -1) return piece
        else if(piece == -2 || piece == -3) return -3
        else if (piece == -4) return -5
        else return -9
    }
}

//Evaluates position based on certain criteria
function evaluate() {
    let evaluation = 0
    for (let i = 0; i < f.length; i++) {
        let piece = b[i]
        if (piece != 7 && piece) {
            //Points for every piece on the board
            evaluation += get_piece_value(piece)*100
            
            //It's good if minor pieces reach many squares
            if (Math.abs(piece) < 5) {
                evaluation += pseudo_moves(i).length*Math.sign(piece)
            }
        }
    }
    return evaluation/100
}

//Sorts moves to get through minimax faster
function all_sorted_moves(color) {
    let moves = all_legal_moves(color)
    moves.forEach(m => {
        let score = 0

        //Score baseret p?? capture v??rdi minus piece v??rdi
        if (m[3]) {
            score = Math.abs(10*get_piece_value(b[m[1]])) - Math.abs(m[2])
        }

        //Promotion to queen is good
        if(Math.abs(m[5]) == 5) {
            score += 9*color
        }

        //Minus points if opponent can capture your piece
        if(all_pseudo_moves(color*-1).includes(m[1])) {
            score -= Math.abs(get_piece_value(m[2]))
        }
        m[7] = score
    })
    moves = moves.sort(function (a, b) {
        if(a[7] === b[7]) return 0
        else return (a[7] > b[7]) ? -1 : 1
    })
    return moves
}

//Finds the best possible evaluation on depth. Alpha-beta pruning is utilized
function minimax(depth, alpha, beta, maximizing_player) {
    if (depth == 0) return evaluate()

    //Skakmat eller stalemate hvis den aktive spiller ikke har flere tr??k
    if((maximizing_player == 1 || maximizing_player == -1) && !all_legal_moves(maximizing_player).length) {
        if (t_is_hit(b.indexOf(6*maximizing_player), maximizing_player*-1)) {
            return -Infinity*maximizing_player
        }
        return 0
    }
    let moves = all_sorted_moves(maximizing_player)
    if (maximizing_player == 1) {
        for (let i = 0; i < moves.length; i++) {
            move(moves[i])
            evaluation = minimax(depth -1, alpha, beta, -1)
            unmake_lm()
            alpha = Math.max(alpha, evaluation)
            if (beta <= alpha) break
        }
        return alpha
    }
    else if (maximizing_player == -1) {
        for (let i = 0; i < moves.length; i++) {
            move(moves[i])
            evaluation = minimax(depth -1, alpha, beta, 1)
            unmake_lm()
            beta = Math.min(beta, evaluation)
            if(beta <= alpha) break
        }
        return beta
    }
}

//Finds best minimax from all current moves
function best_move(depth, color) {
    let current_best_evaluation = Infinity*color*-1
    let moves = all_legal_moves(color)
    if(!moves.length) return
    if (moves.length == 1) {
        return moves[0]
    }
    let current_best_move = 0
    for (let i = 0; i < moves.length; i++) {
        move(moves[i])
        let test_evaluation = minimax(depth-1, -Infinity, Infinity, player_to_move())
        if(color == 1) {
            if (test_evaluation > current_best_evaluation) {
                current_best_evaluation = test_evaluation
                current_best_move = i
            }
        }
        else {
            if (test_evaluation < current_best_evaluation) {
                current_best_evaluation = test_evaluation
                current_best_move = i
            }
        }
        unmake_lm()        
    }
    return moves[current_best_move]
}

//Finds best possible move within the timeframe
function best_in_time (color, time = 1) {
    let t0 = Date.now()
    let moves = all_legal_moves(color)
    let depth = 1
    let current_best_move = 0
    if(!moves.length) return 
    if(moves.length == 1) current_best_move = moves[0]
    else {
        while (Date.now() - t0 < time*1000/(moves.length*0.3)) {
            current_best_move = best_move(depth, color)
            console.log(current_best_move)
            depth += 1
        }
    }

    //Shown in dev visuals
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.rect(h, 0,  h, h);
    ctx.fill();
    ctx.font = "20px Arial";
    ctx.fillStyle = "blue"
    ctx.fillText("Depth reached: " + depth, h+20, 50)
    ctx.fillText("Computer Move: " + tile_to_letternumber(current_best_move[0]) + " to " + tile_to_letternumber(current_best_move[1]), h+20, 100)
    ctx.fillText("Time Spent: " + (Date.now() - t0)/1000 + " seconds", h+20, 150)

    return current_best_move
}

//Makes the computer move the best move within timeframe
function computer_move(time = 1) {
    move(best_in_time(player_to_move(), time))
    ctx.fillText("Evaluation: " + evaluate(), h+20, 200)
    update()
}

function play_the_computer() {
    if(computer_playing) computer_playing = false
    else computer_playing = true
    console.log(computer_playing)
}

//Generates standard chess position
FEN_generate("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
