const Gameboard = (() => {
    let board = [];

    const create = () => {
        const gameGrid = [null, null, null, null, null, null, null, null, null];
        board = [];
        initialBoard = document.querySelector(".gameboard");
        newBoard = document.createElement("div");
        newBoard.classList.add("gameboard");
        gameGrid.forEach((element, index) => {
            cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.cellno = index;
            cell.addEventListener("click", cellClickHandler);
            board.push(cell);
            newBoard.append(cell);
        });
        console.log(newBoard);
        initialBoard.parentNode.replaceChild(newBoard, initialBoard);
    };

    const mark = (cellno,sign) => {
        board[cellno].classList.add(sign);
    }

    return {
        create, mark
    };
})();

const Player = (id, playerName, playerSign) => {
    return {id, playerName, playerSign};
}

const GameController = (() => {
    const messageBar = document.querySelector(".status");
    const game = {
        activePlayer: null,
        players: [],
    };
    const message = (msg) => {
        messageBar.textContent = msg;
    };

    const getState = () => {
        return game
    };

    const startGame = (p1name, p2name) => {
        game.players[0] = Player(0, p1name,'cross');
        game.players[1] = Player(1, p2name,'circle');
        Gameboard.create();
        game.activePlayer = 0;
        GameController.message(`${game.players[game.activePlayer].playerName}'s turn`)
        
    }
    const changeTurn = () => {
        game.activePlayer === 0 ? game.activePlayer = 1 : game.activePlayer = 0;
        GameController.message(`${game.players[game.activePlayer].playerName}'s turn`)
    }
    return { message, startGame, getState, changeTurn };
})();

function cellClickHandler() {
    if (GameController.getState().activePlayer === null) {
        console.log('uh-oh');
        return
    }
    let thisCellNumber = parseInt(this.dataset.cellno);
    let game = GameController.getState();
    Gameboard.mark(thisCellNumber,game.players[game.activePlayer].playerSign);
    this.removeEventListener('click', cellClickHandler);
    GameController.changeTurn();
    // console.log(thisCellNumber);
}

function clickStart() {
    let p1name = document.querySelector("#p1name");
    let p2name = document.querySelector("#p2name");

    if (p1name.value === p2name.value) {
        GameController.message(`player names must be different`);
        return
    }
    else if (p1name.value === '' || p2name.value === '' ) {
        GameController.message(`please insert both player names`);
        return
    }
    else {
        GameController.startGame(p1name.value,p2name.value);
    }
}

document.querySelector("#start-btn").addEventListener("click", clickStart);
