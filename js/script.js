
//IIFE to create the gameboard object, which stores the board state and handles the DOM elements.
const Gameboard = (() => {
    let board = [];
    const messageBar = document.querySelector(".status");
    const message = (msg) => {
        messageBar.textContent = msg;
    };
    
    const create = () => {
        const gridSize = 9;
        board = [];
        let initialBoard = document.querySelector(".gameboard");
        let newBoard = document.createElement("div");
        newBoard.classList.add("gameboard");

        for (let i = 0; i < gridSize; i++) {
            cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.cellno = i;
            cell.addEventListener("click", cellClickHandler);
            board.push(cell);
            newBoard.append(cell);
        }
        // console.log(newBoard);

        initialBoard.parentNode.replaceChild(newBoard, initialBoard);
    };

    const mark = (cellno, sign) => {
        // console.log(board);
        board[cellno].classList.add(sign);
    };

    const getBoard = () => {
        p1board = "";
        p2board = "";
        remainingCells = 0;
        board.forEach((element) => {
            if (element.classList.contains("cross")) {
                p1board += element.dataset.cellno;
            }
            else if (element.classList.contains("circle")) {
                p2board += element.dataset.cellno;
            }
            else {
                remainingCells++;
            }
        });
        return {
            p1: p1board,
            p2: p2board,
            remainingCells
        };
    };

    const markWin = (cells) => {
        board.forEach((element) => {
            element.removeEventListener("click", cellClickHandler);
            if ([...cells].includes(element.dataset.cellno)) {
                // console.log(element.dataset.cellno)
                element.classList.add('win')
            }
        });
    }
    const gameOverDraw = () => {
        board.forEach((element) => {
            element.classList.add('draw');
        })
    }

    return {
        create,
        message,
        mark,
        getBoard,
        markWin,
        gameOverDraw,
    };
})();

// Factory function for player objects
const Player = (id, playerName, playerSign) => {
    return { id, playerName, playerSign };
};


// IIFE to create the GameController Object and all its functions.
const GameController = (() => {
    const game = {
        activePlayer: null,
        gameOver: false,
        players: [],
    };

    const getState = () => {
        return game;
    };

    const startGame = (p1name, p2name) => {
        game.players[0] = Player(0, p1name, "cross");
        game.players[1] = Player(1, p2name, "circle");
        Gameboard.create();
        game.activePlayer = 0;
        game.gameOver = false;
        Gameboard.message(`${game.players[game.activePlayer].playerName}'s turn`);
    };
    const changeTurn = () => {
        game.activePlayer === 0 ? (game.activePlayer = 1) : (game.activePlayer = 0);
        Gameboard.message(`${game.players[game.activePlayer].playerName}'s turn`);
    };
    const checkWinnerOnClick = (player) => {
        let winmap = ["012", "345", "678", "036", "147", "258", "048", "246"];
        let boardState = Gameboard.getBoard();
        let playerState = player.playerSign === "cross" ? boardState.p1 : boardState.p2;
        // console.log(`Current board state for ${player.playerName}: ${playerState}`);

        // function to check if all items in an array are contained within a reference array.
        let checker = (reference, testedArray) => testedArray.every(digit => reference.includes(digit));

        let match = false;
        for (const candidate of winmap) {
            // console.log(`checking if current state contains all cells in ${candidate}`);
            if (checker([...playerState],[...candidate])) {
                match = candidate;
                // return match
            };
        }
        if (match) {
            Gameboard.markWin(match);
            Gameboard.message(`${player.playerName} won`);
            game.gameOver = true;
            return
        }
        if (boardState.remainingCells === 0) {
            console.log('test');
            game.gameOver = true;
            Gameboard.gameOverDraw();
            Gameboard.message('It\'s a draw!');
        }
        // match ? console.log(`${player.playerName} won`) : console.log('nobody won');
        return match;
    };

    return { startGame, getState, changeTurn, checkWinnerOnClick };
})();

function cellClickHandler() {
    if (GameController.getState().activePlayer === null) {
        console.log("uh-oh");
        return;
    }
    let thisCellNumber = parseInt(this.dataset.cellno);
    let game = GameController.getState();
    Gameboard.mark(thisCellNumber, game.players[game.activePlayer].playerSign);
    this.removeEventListener("click", cellClickHandler);
    GameController.checkWinnerOnClick(game.players[game.activePlayer])
    if (GameController.getState().gameOver === false) {
        GameController.changeTurn();
    }
    // console.log(thisCellNumber);
}

function clickStart() {
    let p1name = document.querySelector("#p1name");
    let p2name = document.querySelector("#p2name");

    if (p1name.value === p2name.value) {
        Gameboard.message(`player names must be different`);
        return;
    } else if (p1name.value === "" || p2name.value === "") {
        Gameboard.message(`please insert both player names`);
        return;
    } else {
        GameController.startGame(p1name.value, p2name.value);
    }
}

document.querySelector("#start-btn").addEventListener("click", clickStart);

// some manual tests

// Testing for a draw
// GameController.startGame('Tizio','Caio');
// Gameboard.mark(0,'cross');
// Gameboard.mark(4,'circle');
// Gameboard.mark(8,'cross');
// Gameboard.mark(1,'circle');
// Gameboard.mark(7,'cross');
// Gameboard.mark(6,'circle');
// Gameboard.mark(2,'cross');
// Gameboard.mark(3,'circle');
// Gameboard.mark(5,'cross');
// GameController.checkWinnerOnClick(0,GameController.getState().players[0])


// console.log(GameController.checkWinnerOnClick(GameController.getState().players[0]))