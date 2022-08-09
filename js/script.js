//IIFE to create the gameboard object, which stores the board state and handles the DOM elements.
const Gameboard = (() => {
    let board = [];
    const messageBar = document.querySelector(".status");
    // displays a message on the bar above the game board
    const message = (msg) => {
        messageBar.textContent = msg;
    };

    // Creates a new board and places it in the DOM, replacing the old board.
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

    // adds a specific class to a specific cell
    const mark = (cellno, sign) => {
        // console.log(board);
        board[cellno].classList.add(sign);
        board[cellno].removeEventListener("click", cellClickHandler);
    };

    // returns an object with:
    // - Player 1's marked cells (as a string)
    // - Player 2's marked cells (as a string)
    // - a count of the remaining empty cells
    const getBoard = () => {
        p1board = "";
        p2board = "";
        wholeBoard = [];
        remainingCells = 0;
        board.forEach((element) => {
            if (element.classList.contains("cross")) {
                p1board += element.dataset.cellno;
                wholeBoard.push("0");
            } else if (element.classList.contains("circle")) {
                p2board += element.dataset.cellno;
                wholeBoard.push("1");
            } else {
                remainingCells++;
                wholeBoard.push(null);
            }
        });
        return {
            wholeBoard,
            remainingCells,
        };
    };

    // called when a win is detected
    // takes a string made of digits as an argument (representing cell indexes of a winning triplet, e.g. "012").
    // and adds the "win" class to the corresponding cells in the board
    // also removes the click event listener for all cells
    const markWin = (cells) => {
        board.forEach((element) => {
            element.removeEventListener("click", cellClickHandler);
            if ([...cells].includes(element.dataset.cellno)) {
                // console.log(element.dataset.cellno)
                element.classList.add("win");
            }
        });
    };
    // called when a draw is detected
    // adds the "draw" class to all cells in the board
    const gameOverDraw = () => {
        board.forEach((element) => {
            element.classList.add("draw");
        });
    };

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
    // all possible winning triplets
    const winmap = ["012", "345", "678", "036", "147", "258", "048", "246"];

    // function to check if all items in an array are contained within a reference array.
    const isSubset = (testedArray, reference) => testedArray.every((digit) => reference.includes(digit));

    // private object storing the state of the game
    const game = {
        activePlayer: null,
        gameOver: false,
        players: [],
    };

    // returns the state of the game
    const getState = () => {
        return game;
    };

    // called when the start button is pressed and player names are validated
    const startGame = (p1name, p2name) => {
        // reset the game state
        game.players[0] = Player(0, p1name, "cross");
        game.players[1] = Player(1, p2name, "circle");
        game.activePlayer = 0;
        game.gameOver = false;

        // Reset the game board and announces it's p1's turn
        Gameboard.create();
        Gameboard.message(`${game.players[game.activePlayer].playerName}'s turn`);
    };
    // called after a cell is clicked and the game is not over yet
    // toggles the active player and announces it's the other player's turn
    const changeTurn = () => {
        game.activePlayer === 0 ? (game.activePlayer = 1) : (game.activePlayer = 0);
        Gameboard.message(`${game.players[game.activePlayer].playerName}'s turn`);
    };

    // called after every click to check if the player who clicked the cell has won the game,
    // or if the player clicked the last available cell (in which case it triggers a draw)
    const checkWinnerOnClick = (player) => {
        let boardState = Gameboard.getBoard();
        let match = isWin(boardState.wholeBoard,player.id)
        // if a match is found, i.e. it's not false, call the functions necessary to declare a win and end the game
        if (match) {
            Gameboard.markWin(match);
            Gameboard.message(`${player.playerName} won`);
            game.gameOver = true;
            return;
        }
        // if nobody won and there are no remaining cells, end the game and call a draw
        else if (boardState.remainingCells === 0) {
            // console.log('test');
            game.gameOver = true;
            Gameboard.gameOverDraw();
            Gameboard.message("It's a draw!");
        }
        // match ? console.log(`${player.playerName} won`) : console.log('nobody won');
        return match;
    };

    const clickCell = (cellno) => {
        cellToClick = document.querySelector(`[data-cellno="${cellno}"]`);
        // mark the cell and remove the event listener from it
        Gameboard.mark(cellno, game.players[game.activePlayer].playerSign);
        // check if the player made a game-ending move
        checkWinnerOnClick(game.players[game.activePlayer]);
        if (getState().gameOver === false) {
            changeTurn();
        }
    };

    const getPlayerBoard = (board,playerID) => {
        filteredArray = board.reduce(function(previousValue,currentValue, currentIndex) {
            // console.log(currentIndex);
            if (parseInt(currentValue) === playerID) {
                // console.log(currentValue,currentIndex);
                previousValue.push(currentIndex.toString());
            } 
            return previousValue
        },[])
        // console.log(filteredArray);
        return filteredArray
    };

    // Helper function that takes an array representation of a board and a playerID.
    // returns a string with the cell numbers of the winning triplet if it's a win
    // returns false if not a win
    // examples:
    // isWin([ null, "0", "0", "1", "1", "1", null, "0", null ],0) // returns false
    // isWin([ "0", "1", "1", null, "0", null, null, null, "0" ],0) // returns "048"
    const isWin = (board,playerID) => {
        // get an array containing all cells marked by the desired player
        let playerState = getPlayerBoard(board,playerID);
        // console.log(`Current board state for ${player.playerName}: ${playerState}`);

        let match = false;
        // loop through all possible winning triplets and check if one of them is a subset of the player's state
        for (const candidate of winmap) {
            // console.log(`checking if current state contains all cells in ${candidate}`);
            if (isSubset([...candidate], playerState)) {
                // if a match is found, store it in a variable
                match = candidate;
            }
        }
        return match
    }

    return {
        startGame,
        getState,
        clickCell,
        changeTurn,
        checkWinnerOnClick,
        getPlayerBoard
    };
})();

// Event Listener callback function to handle a click on a cell
function cellClickHandler() {
    //This shouldn't ever be called, it's here just for safety
    if (GameController.getState().activePlayer === null) {
        console.log("uh-oh");
        return;
    }
    let thisCellNumber = parseInt(this.dataset.cellno);
    GameController.clickCell(thisCellNumber);
}

function clickStart() {
    let p1name = document.querySelector("#p1name");
    let p2name = document.querySelector("#p2name");

    //Basic checks on player names
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
// GameController.clickCell(0);
// GameController.clickCell(4);
// GameController.clickCell(8);
// GameController.clickCell(1);
// GameController.clickCell(7);
// GameController.clickCell(6);
// GameController.clickCell(2);
// GameController.clickCell(5);
// GameController.clickCell(3);

