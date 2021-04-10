/*
TODO:


lav turskifte

lav flere pawn promotion muligheder

lav castling, promotion, check_check for black, pessant
*/



white_to_move = true
//match moves
mm = []
//last move
lm = ["EW", 110, 110, 110, 110]

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
                lm = [this.abbreviation, this.x, this.y, x, y]
                mm.push(lm)
                b[x][y] = b[this.x][this.y]
                b[this.x][this.y] = "O"
                update_xy(x,y)
                this.first_move = false
                if(ap == 1) ap = -1
                else ap = 1
                console.log(king_position(b))
                return
            }
        }
        console.log("Illegal move")
        //if mouse coords = indexof moves: change piece coords and kill pieces previously there
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
                    legal_moves.splice(i,1,[])

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
        if(this.first_move == true && b[this.x][this.y+2*direction] == "O") {
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
        

        
        return this.ruleCheck(moves)
    }
    move(x,y) {
        if(lm[0] == "bp" && x == lm[3] && y == lm[4] + 1) {
            insert_piece(lm[3], lm[4], "O")
            console.log("en pessant")
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
        let om = opponent_moves(b)
        let r_checked = false
        if (this.first_move) {
            for (let i = 0; i < om.length; i++) {
                if(om[i][1] == 1 && (om[i][0] == 6 || om[i][0] == 7)) {
                    r_checked = true
                }
            }
            
            if (b[8][1].first_move && b[7][1] == "O" && b[6][1] == "O" && !r_checked) {
                return [this.x+2, this.y]
            }
            
        }
    }
    get castle_l() {
        let om = opponent_moves(b)
        let l_checked = false
        if(this.first_move) {
            for (let i = 0; i < om.length; i++) {
                if(om[i][1] == 1 && (om[i][0] == 4 || om[i][0] == 3)) {
                    l_checked = true
                }
            }
            if (b[1][1].first_move && b[2][1] == "O" && b[3][1] == "O" && b[4][1] == "O" && !l_checked) {
                return [this.x-2, this.y]
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
        let first_question_mark = this.first_move
        super.move(x,y)
        if (first_question_mark && x == 7 && b[7][1].constructor.name == "King") {
            
            
            
                b[6][1] = b[8][1]
                b[8][1] = "O"
                update_xy(6,1)
                b[6][1].first_move = false
        }
        else if (first_question_mark && x == 3 && b[3][1].constructor.name == "King") {
            b[4][1] = b[1][1]
            b[1][1] = "O"
            update_xy(4,1)
            b[4][1].first_move = false
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


code = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"


function FEN_generate(code) {
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

FEN_generate(code)



function update_xy(x,y) {
    b[x][y].x = x
    b[x][y].y = y
}

function opponent_moves(b) {
    let their_moves = []
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
    
    return their_moves
}

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


console.log(opponent_moves(b))
console.log(your_moves(b))