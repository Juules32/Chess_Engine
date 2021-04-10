/*
TODO:


lav turskifte

lav flere pawn promotion muligheder

lav castling, promotion, check_check for black, pessant
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


white_to_move = true
//match moves
mm = []
//last move
lm = ["EW", 110, 110, 110, 110]




//active player
ap = 1


piece_names = ["wp", "wr", "wn", "wb", "wq", "wk", "bp", "br", "bn", "bb", "bq", "bk"]
var images = []
i = 0
for (let i = 0; i < piece_names.length; i++) {
    images[i] = new Image()
    images[i].src = "./" + piece_names[i] + ".png"
}

function clear_b() {
    let b = []
    for (let i = 0; i < 10; i++) {
        b.push(["O"])
        for (let j = 0; j < 9; j++) {
            b[i].push("O")            
        }
    }
    return b
}

b = clear_b()

class Piece {
    constructor(color = "w") {
        this.color = color
    }
    first_move = true
    get abbreviation() {return this.color + this.constructor.name.charAt(0).toLowerCase()}
    get image() {return images[piece_names.indexOf(this.abbreviation)]}

    move(x, y) {
        for (let i = 0; i < this.moves.length; i++) {
            if(this.moves[i][0] == x && this.moves[i][1] == y) {
                lm = [this.abbreviation, this.x, this.y, x, y] //ændr, så ikke hele objektet
                if (b[x][y] != "O") {
                    lm.push("x", b[x][y])
                }
                if (this.constructor.name == "King") {
                    
                    if(x == this.x+2) {
                        lm.push("rc")
                    }
                    if(x == this.x-2) {
                        lm.push("lc")
                    }
                }
                lm.push(this.first_move)
                mm.push(lm)
                b[x][y] = b[this.x][this.y]
                b[this.x][this.y] = "O"
                update_xy(x,y)
                this.first_move = false
                if(ap == 1) ap = -1
                else ap = 1
                console.log(lm)
                return
            }
        }
        console.log("Illegal move")
        //if mouse coords = indexof moves: change piece coords and kill piece previously there
    }
    get moves() {
        let legal_moves = this.unchecked_moves
        let x0 = this.x
        let y0 = this.y
        let unchecked = this.unchecked_moves
        for (let i = 0; i < unchecked.length; i++) {
            
            let x = unchecked[i][0]
            let y = unchecked[i][1]
            let test_b = b
            let temp = test_b[x][y]

            test_b[x][y] = test_b[x0][y0]
            test_b[x0][y0] = "O"
            test_b[x][y].x = x
            test_b[x][y].y = y
            for (let j = 0; j < opponent_moves(test_b).length; j++) {
                if(opponent_moves(test_b)[j][0] == king_position(test_b)[0] &&
                opponent_moves(test_b)[j][1] == king_position(test_b)[1]) {
                    legal_moves.splice(i,1, [])
                    
                }
                
            }
            test_b[x0][y0] = test_b[x][y]
            test_b[x][y] = temp
            test_b[x0][y0].x = x0
            test_b[x0][y0].y = y0
        }
        return legal_moves
    }
}

class PNK extends Piece { //Pawn, Knight, King

    ruleCheck(move_list) { //(array)
        //Regler for at trække: ikke 2 brikker på samme sted og aldrig udenfor brættet, 
        //og at rykke slutter din tur og timer
        //if(ingen overlappende brikker, inden for brættet) return true
        
        let confirmed_moves = []
        for (let i = 0; i < move_list.length; i++) {
            let x = move_list[i][0]
            let y = move_list[i][1]
            if((x > 8 || x < 1 || y > 8 || y < 1) || b[x][y].color == this.color) {
                continue
            }
            else {
                confirmed_moves.push(move_list[i])
            }
        }
        
        return confirmed_moves
    }
}

class Pawn extends PNK {
    second_move = false
    get unchecked_moves() {
        let direction = 1
        if(this.color == "b") {
            direction = -1
        }
        let moves = []
        if(b[this.x][this.y+direction] == "O") {
            moves.push([this.x, this.y+direction])
        }
        if(this.first_move == true && b[this.x][this.y+2*direction] == "O" && b[this.x][this.y+1*direction] == "O") {
            moves.push([this.x, this.y+2*direction])
        }
        if(b[this.x-direction][this.y+direction] != "O") {
            moves.push([this.x-direction, this.y+direction])
        }
        if(b[this.x+direction][this.y+direction] != "O") {
            moves.push([this.x+direction, this.y+direction])
        }

        // en pessant
        if(this.y == 5 && mm.length > 0) {
            if(lm[0] == "bp" && lm[1] == this.x - 1 && lm[2] == this.y + 2 && lm[4] == this.y) {
                
                moves.push([this.x-1, this.y+direction])
            }
            if(lm[0] == "bp" && lm[1] == this.x + 1 && lm[2] == this.y + 2 && lm[4] == this.y) {
                moves.push([this.x+1, this.y+direction])
            }
        }
        if(this.y == 4 && mm.length > 0) {
            if(lm[0] == "wp" && lm[1] == this.x - 1 && lm[2] == this.y - 2 && lm[4] == this.y) {
                
                moves.push([this.x-1, this.y+direction])
            }
            if(lm[0] == "wp" && lm[1] == this.x + 1 && lm[2] == this.y - 2 && lm[4] == this.y) {
                moves.push([this.x+1, this.y+direction])
            }
        }
        return this.ruleCheck(moves)
    }
    move(x,y) {
        if(lm[0] == "bp" && x == lm[3] && y == lm[4] + 1) {
            insert_piece(lm[3], lm[4], "O")
            console.log("En pessant")
        }
        if(lm[0] == "wp" && x == lm[3] && y == lm[4] - 1) {
            insert_piece(lm[3], lm[4], "O")
            console.log("En pessant")
        }
        let first = this.first_move
        this.second_move = false
        super.move(x,y)
        if (first) this.second_move = true
        
        let end = 8
        if(this.color == "b") {
            end = 1
        }
        if(this.y == end) {
            insert_piece(this.x,this.y, new Queen(this.color))
        }
        
    }
}

class Knight extends PNK {
    abbreviation = this.color + "n"
    get unchecked_moves() {
        let moves = []
        for (let i = -1; i < 2; i = i + 2){

        moves.push([this.x+i*2, this.y+i])
        moves.push([this.x+i*2, this.y-i])

        moves.push([this.x+i, this.y+i*2])
        moves.push([this.x-i, this.y+i*2])
        }

        return this.ruleCheck(moves)
    }
}

class King extends PNK {
    get unchecked_moves() {
        let start_moves = []
        
        for (let i = -1; i < 2; i = i + 2){
            start_moves.push([this.x+i, this.y])
            start_moves.push([this.x, this.y+i])
            start_moves.push([this.x+i, this.y+i])
            start_moves.push([this.x+i, this.y-i])
        }
        
        return this.ruleCheck(start_moves)
    }
    get castle_r() {
        let om = "wow"
        if (this.first_move) {
            if (this.color = "w") {
                om = opponent_moves(b, "b")
            }
            else {
                om = opponent_moves(b, "w")
            }
            let r_checked = false
            let king_y = 8
            if(this.color == "w") {
                king_y = 1
            }//problem
            if(this.x == 5) {
                for (let i = 0; i < om.length; i++) {
                    if(om[i][1] == king_y && (om[i][0] == 6 || om[i][0] == 7)) {
                        r_checked = true
                    }
                }
                
                if (b[8][king_y].first_move && b[7][king_y] == "O" && b[6][king_y] == "O" && !r_checked) {
                    return [this.x+2, this.y]
                }
            }
            
            
        }
    }
    get castle_l() {
        
        if(this.first_move) {
            let om = opponent_moves(b)
            let l_checked = false
            let king_y = 8
            if(this.color == "w") {
                king_y = 1
            }
            if(this.x == 5) {
                for (let i = 0; i < om.length; i++) {
                    if(om[i][1] == king_y && (om[i][0] == 4 || om[i][0] == 3)) {
                        l_checked = true
                    }
                }
                if (b[1][king_y].first_move && b[2][king_y] == "O" && b[3][king_y] == "O" && b[4][king_y] == "O" && !l_checked) {
                    return [this.x-2, this.y]
                }
            }
        }
        
    }
    get moves() {
        
        let moves = []
        moves = super.moves
        if(this.castle_r != undefined) {
            moves.push(this.castle_r)
        }
        if(this.castle_l != undefined) {
            moves.push(this.castle_l)
        }
        return moves
    }
    move(x, y) {
        let king_y = this.y
            
        let first_question_mark = this.first_move
        super.move(x,y)
        if(this.x == x) {
            if (first_question_mark && x == 7) {
                swap_pieces(8,king_y,6,king_y)
                b[6][king_y].first_move = false
                console.log("King side castle")
            }
            else if (first_question_mark && x == 3) {
                b[4][king_y] = b[1][king_y]
                b[1][king_y] = "O"
                update_xy(4,king_y)
                b[4][king_y].first_move = false
                console.log("Queen side castle")

            }
        }
    }
}

class RBQ extends Piece { //Rook, Bishop, Queen
    get unchecked_moves() {
        let moves = []
        
        if(this.constructor.name == "Rook" || this.constructor.name == "Queen") {
            for (let i = 0; i < 4; i++) {
                let x = this.x
                let y = this.y
                for (let j = 1; j < 9; j++) {
                    if(i == 0) {
                        x = this.x - j
                    }
                    else if (i == 1) {
                        x = this.x + j
                    }
                    else if (i == 2) {
                        y = this.y - j
                    }
                    else {
                        y = this.y + j
                    }
        
                    if(x > 8 || x < 1 || y > 8 || y < 1 || b[x][y].color == this.color) {
                        break
                    }
                    else if (b[x][y].color != this.color && b[x][y].color != undefined) {
                        moves.push([x, y])
                        break
                    }
                    else {
                        moves.push([x, y])
                    }
                }
            }
        }
        if(this.constructor.name == "Bishop" || this.constructor.name == "Queen") {
            for (let i = 0; i < 4; i++) {
                let x = this.x
                let y = this.y
                for (let j = 1; j < 9; j++) {
                    if(i == 0) {
                        x = this.x - j
                        y = this.y - j
                    }
                    else if (i == 1) {
                        x = this.x + j
                        y = this.y + j

                    }
                    else if (i == 2) {
                        x = this.x + j
                        y = this.y - j
                    }
                    else {
                        x = this.x - j
                        y = this.y + j
                    }
        
                    if(x > 8 || x < 1 || y > 8 || y < 1 || b[x][y].color == this.color) {
                        break
                    }
                    else if (b[x][y].color != this.color && b[x][y].color != undefined) {
                        moves.push([x, y])
                        break
                    }
                    else {
                        moves.push([x, y])
                    }
                }
            }
        }   
        return moves
    }   
}


class Rook extends RBQ {
}

class Bishop extends RBQ {
}

class Queen extends RBQ {
}

function update_all() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            update_xy(i,j)
        }
    }
}


code = "ppkppppp/pppppppp/8/8/8/8/PPPPppp/RNBQK2R"


function FEN_generate(code, b) {
    clear_b()
    let y = 8
    let x = 1
    for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) == "/") {
            y -= 1
            x = 1
        }
        else {
            if (isNaN(code.charAt(i) / 2)) {
                if(code.charAt(i) == "r") b[x][y] = new Rook("b")
                else if (code.charAt(i) == "n") b[x][y] = new Knight("b")
                else if (code.charAt(i) == "b") b[x][y] = new Bishop("b")
                else if (code.charAt(i) == "q") b[x][y] = new Queen("b")
                else if (code.charAt(i) == "k") b[x][y] = new King("b")
                else if (code.charAt(i) == "p") b[x][y] = new Pawn("b")

                else if (code.charAt(i) == "R") b[x][y] = new Rook()
                else if (code.charAt(i) == "N") b[x][y] = new Knight()
                else if (code.charAt(i) == "B") b[x][y] = new Bishop()
                else if (code.charAt(i) == "Q") b[x][y] = new Queen()
                else if (code.charAt(i) == "K") b[x][y] = new King()
                else if (code.charAt(i) == "P") b[x][y] = new Pawn()

                x += 1
            }
            else {
                x += parseInt(code.charAt(i))
            }
        }

    }
    update_all()
}




function update_xy(x,y) {
    b[x][y].x = x
    b[x][y].y = y
}

function opponent_moves(b, color = "none") { //color er lavet hvis man vil finde ud fra farve og ikke tur
    let their_moves = []

    if (color == "none") {
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                if (b[i][j] == "O") continue
                else if (b[i][j].color == "w" && ap == 1) continue
                else if (b[i][j].color == "b" && ap == -1) continue
                else {
                    their_moves = their_moves.concat(b[i][j].unchecked_moves)
                }
            }
            
        }
    }
    if (color == "b") {
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                if (b[i][j] == "O") continue
                else if (b[i][j].color == "w") continue
                else {
                    their_moves = their_moves.concat(b[i][j].unchecked_moves)
                }
            }
            
        }
    }
    if (color == "w") {
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                if (b[i][j] == "O") continue
                else if (b[i][j].color == "b") continue
                else {
                    their_moves = their_moves.concat(b[i][j].unchecked_moves)
                }
            }
            
        }
    }

        
    
    return their_moves
}




function king_position(b) {
    for (let i = 0; i < 100; i++) {
        let x = i % 10
        let y = Math.floor(i/10)
        if (ap == 1) {
            if (b[x][y].abbreviation == "wk") {
                return [x,y]
            }
        }
        else if (b[x][y].abbreviation == "bk") {
            return [x,y]
        }
        
        
    }
}

function insert_piece(x, y, piece) {
    b[x][y] = piece
    update_xy(x,y)
    update()
}




mouse_x = 0
mouse_y = 0
down_x = 0
down_y = 0
mouse_is_down = false
var active_piece
var active_tile_color
p = 0

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

    for (let i = 0; i < 9*8; i++) {
        let x = i % 9
        let y = Math.floor(i/9)
        if(b[x+1][y+1] != "O") {
            ctx.drawImage(b[x+1][y+1].image, b[x+1][y+1].x*ts - ts, h+ts-b[x+1][y+1].y*ts - ts, ts, ts)
        }                
    }
    
}

window.onload = function() {update()}
    


function mousemove(event) {
    
    
    mouse_x = Math.ceil((event.x - canvas_boundary.left)/ts) 
    mouse_y = 8 - Math.floor((event.y - canvas_boundary.top)/ts)

    if (mouse_is_down && active_piece != "O") {
        update()
        if(b[down_x][down_y] != "O") {
            for (let i = 0; i < active_piece_moves.length; i++) {
                ctx.fillStyle = "gray"
                ctx.beginPath();
                ctx.arc(active_piece_moves[i][0]*ts - ts/2, h - active_piece_moves[i][1]*ts + ts/2, ts/ 5, 0, 7);
                ctx.fill();
            }
        }
        
        if (down_x % 2 == 1) p = 1
        else p = 0
        if ((down_y + p) % 2 == 1) ctx.fillStyle = "white"
        else ctx.fillStyle = "brown"
    
        ctx.beginPath();
        ctx.rect((down_x-1)*ts, (8-down_y)*ts, ts, ts);
        ctx.fill();
        ctx.drawImage(b[down_x][down_y].image, event.x - canvas_boundary.left - ts/2, event.y - canvas_boundary.top - ts/2, ts, ts)
    }
}
function mousedown() {
    if ((b[mouse_x][mouse_y].color == "w") || (ap == -1 && b[mouse_x][mouse_y].color == "b")) {
        console.log(b[mouse_x][mouse_y])
    }
    if((ap == 1 && b[mouse_x][mouse_y].color == "w") || ((ap == -1 && b[mouse_x][mouse_y].color == "b"))) {

    
        down_x = mouse_x
        down_y = mouse_y
        active_piece = b[down_x][down_y]
        active_piece_moves = active_piece.moves //THIS makes the program 10x faster
        mouse_is_down = true
        

        if(active_piece != "O") {
            for (let i = 0; i < active_piece_moves.length; i++) {
                ctx.fillStyle = "gray"
                ctx.beginPath();
                ctx.arc(active_piece_moves[i][0]*ts - ts/2, h - active_piece_moves[i][1]*ts + ts/2, ts/ 5, 0, 7);
                ctx.fill();
            }
        }
    }
}

function mouseup() {
    if(mouse_is_down) {
        console.log("up")
        mouse_is_down = false
        if (active_piece != "O" && (down_x != mouse_x || down_y != mouse_y)) {
            b[down_x][down_y].move(mouse_x, mouse_y)
        }
        update()
    }
    
}




function find_legal_moves(c) {
    let legal_moves = []
    if(c == "w") {
        for (let i = 1; i <= 8; i++) {
            for (let j = 1; j <= 8; j++) {
                if (b[i][j] != "O") {
                    if(b[i][j].color == "w") {
                        for (let p = 0; p < b[i][j].moves.length; p++) {
                            if (b[i][j].moves[p] != 0) {
                                legal_moves.push([i, j, b[i][j].moves[p][0], b[i][j].moves[p][1]])
                            }
                        }
                    }

                }
            }
            
        }
    }
    else {
        for (let i = 1; i <= 8; i++) {
            for (let j = 1; j <= 8; j++) {
                if (b[i][j] != "O") {
                    if(b[i][j].color == "b" && b[i][j].moves.length > 0) {
                        for (let p = 0; p < b[i][j].moves.length; p++) {
                            legal_moves.push([i, j, b[i][j].moves[p][0], b[i][j].moves[p][1]])
                            
                        }
                    }

                }
            }
            
        }
        
    }
    return legal_moves
}

/*
function your_moves(b) {
    let our_moves = []
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                if (b[i][j] == "O") continue
                else if (b[i][j].color == "w" && ap == -1) continue
                else if (b[i][j].color == "b" && ap == 1) continue
                else {
                    our_moves = our_moves.concat(b[i][j].unchecked_moves)
                }
            }
            
        }
    
    return our_moves
}*/

numPositions = 0

b = clear_b()
FEN_generate(code, b)


function swap_pieces(x1,y1,x2,y2) {
    temp = b[x2][y2]
    b[x2][y2] = b[x1][y1]
    b[x1][y1] = temp
    update_xy(x2,y2)
    update_xy(x1,y1)
}

function movegen(depth) {
        if (depth == 0) {
            return 1
        }

        let legal_moves = 0
        if(depth % 2 == 1) {
            legal_moves = find_legal_moves("w")
        }
        else {
            legal_moves = find_legal_moves("b") 
        }

        let numPositions = 0
        console.log(legal_moves)
        let first_ques = false
        for (let i = 0; i < legal_moves.length; i++) {
            if(b[legal_moves[i][0]][legal_moves[i][1]].first_move == true) {
                first_ques = true
            }
            else {
                first_ques = false
            }
            b[legal_moves[i][0]][legal_moves[i][1]].move(legal_moves[i][2], legal_moves[i][3])
            
            
            numPositions += movegen(depth-1)
            
            //undo
            swap_pieces(lm[3],lm[4],lm[1],lm[2])
            if (ap == 1) {
                ap = -1
            }
            else {
                ap = 1
            }
            if (first_ques == true) {
                b[lm[1]][lm[2]].first_move = true
            }
            if (lm[5] != undefined) {
                if (lm[5] == "x") {
                    b[legal_moves[i][2]][legal_moves[i][3]] = lm[6]
                    //evt fix et kommende problem med first move
                }
                else if (lm[5] == "rc") {
    
                    swap_pieces(6,lm[2],8,lm[2])
                    b[8][lm[2]].first_move = true
    
                }
                else if (lm[5] == "lc") {
                    swap_pieces(4,lm[2],1,lm[2])
                    b[1,lm[2]].first_move = true
                }
            }
            
            
            
            //der bliver også et problem med at reverte pawns second move
        }
        return numPositions
    
    
}

console.log(movegen(1))
//undo

