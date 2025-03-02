function createGameboard() {
    const board = Array(9).fill(null);

    const getBoard = () => board;
    const updateBoard = (index, value) => {
        board[index] = value;
    };
    const resetBoard = () => {
        board.fill(null);
    };

    return { getBoard, updateBoard, resetBoard };
};

function createPlayer(playerNo) {
    let name = prompt(`Enter Player ${playerNo}'s Name`) || `Player ${playerNo}`;
    const marker = playerNo === 1 ? "X" : "O";

    const getName = () => {
        return name;
    };
    const getMarker = () => {
        return marker;
    };

    return { getName, getMarker };
}

function createButton({ id, classNames = [], text, handleButtonClick = () => { } }) {
    const button = document.createElement("button");

    if (id) {
        button.id = id;
    }

    if (classNames.length) {
        button.classList.add(...classNames);
    }

    if (text) {
        button.textContent = text;
    }

    button.addEventListener("click", (event) => {
        handleButtonClick(event);
    });

    return button;
}

function createUIControls() {
    const mainContainer = document.querySelector("main");
    const gameboardContainer = document.querySelector(".gameboard");
    const gameStatusHeading = document.querySelector(".game-status");

    const handleGameboardClick = (handleGameboardCellClick) => {
        const handleGameboardContainerClick = (event) => {
            const cell = event.target.closest(".cell");

            if (!cell) return;

            handleGameboardCellClick(cell.id);
        };

        gameboardContainer.addEventListener("click", handleGameboardContainerClick);
    };

    const renderGameboard = (board = []) => {
        gameboardContainer.innerHTML = "";

        board.forEach((cell, index) => {
            const cellButton = document.createElement("button");
            cellButton.classList.add("cell");
            cellButton.textContent = cell || "";
            cellButton.id = index;

            gameboardContainer.appendChild(cellButton);
        });
    };

    const updateGameStatusHeading = (statusText) => {
        gameStatusHeading.textContent = statusText;
    };

    const addResetButton = (handleReset) => {
        const handleResetButtonClick = (event) => {
            const resetButton = event.target.closest(".reset");
            resetButton.remove();
            handleReset();
        };

        const resetButton = createButton({ classNames: ["reset"], text: "Reset", handleButtonClick: handleResetButtonClick });

        mainContainer.appendChild(resetButton);
    };

    const addStartButton = (handleStart) => {
        const handleStartButtonClick = (event) => {
            const startButton = event.target.closest(".start");
            startButton.remove();
            handleStart();
        };

        const startButton = createButton({ classNames: ["start"], text: "Start", handleButtonClick: handleStartButtonClick });

        mainContainer.appendChild(startButton);
    };

    return { renderGameboard, updateGameStatusHeading, handleGameboardClick, addResetButton, addStartButton };
}

const Game = (function (createGameboard, createUIControls) {
    const gameboard = createGameboard();

    const uiControls = createUIControls();

    let player1 = null;
    let player2 = null;

    let activePlayer = null;

    const GAME_STATUS = {
        NOT_STARTED: "NOT_STARTED",
        ONGOING: "ONGOING",
        WINNER: "WINNER",
        DRAW: "DRAW",
    };

    const gameState = {
        status: GAME_STATUS.NOT_STARTED,
    };

    const winningCombination = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const initializePlayers = () => {
        uiControls.updateGameStatusHeading("Select Player 1 Name");
        player1 = createPlayer(1);

        uiControls.updateGameStatusHeading("Select Player 2 Name");
        player2 = createPlayer(2);

        activePlayer = player1;
    };

    const handleStart = () => {
        gameState.status = GAME_STATUS.ONGOING;

        initializePlayers();

        const gameStartStatusText = `${activePlayer.getName()}'s (${activePlayer.getMarker()}) Turn`;
        uiControls.updateGameStatusHeading(gameStartStatusText);
    };

    const initializeUI = () => {
        uiControls.renderGameboard(gameboard.getBoard());
        uiControls.updateGameStatusHeading("Let's Play");
        uiControls.addStartButton(handleStart);
    };

    const handleReset = () => {
        gameboard.resetBoard();
        gameState.status = GAME_STATUS.NOT_STARTED;
        initializeUI();
    };

    const handleRoundEnd = (gameStatus, gameStatusText) => {
        gameState.status = gameStatus;
        uiControls.updateGameStatusHeading(gameStatusText);
        uiControls.addResetButton(handleReset);
    };

    const checkGameStatus = () => {
        const board = gameboard.getBoard();
        for (const combination of winningCombination) {
            const [pos1, pos2, pos3] = combination;
            if (board[pos1] && (board[pos1] === board[pos2]) && (board[pos1] === board[pos3])) {
                return GAME_STATUS.WINNER;
            }
        }

        if (!board.includes(null)) {
            return GAME_STATUS.DRAW;
        }

        return GAME_STATUS.ONGOING;
    };

    const toggleActivePlayer = () => {
        if (activePlayer === player1) {
            activePlayer = player2;
        } else {
            activePlayer = player1;
        }
    };

    const handlePlayerChoice = (cellIndex) => {
        if (gameState.status !== GAME_STATUS.ONGOING) {
            return;
        }

        const board = gameboard.getBoard();
        if (board[cellIndex]) {
            return;
        } else {
            gameboard.updateBoard(cellIndex, activePlayer.getMarker());
            uiControls.renderGameboard(board);
        }

        const gameStatus = checkGameStatus();
        switch (gameStatus) {
            case GAME_STATUS.WINNER:
                const gameWonStatusText = `${activePlayer.getName()} (${activePlayer.getMarker()}) wins!`;
                handleRoundEnd(gameStatus, gameWonStatusText);
                break;

            case GAME_STATUS.DRAW:
                const gameDrawStatusText = `It's a draw.`;
                handleRoundEnd(gameStatus, gameDrawStatusText);
                break;

            case GAME_STATUS.ONGOING:
                toggleActivePlayer();
                const gamePlayerTurnStatusText = `${activePlayer.getName()}'s (${activePlayer.getMarker()}) Turn`;
                uiControls.updateGameStatusHeading(gamePlayerTurnStatusText);
                break;
        }
    };

    const init = () => {
        uiControls.handleGameboardClick(handlePlayerChoice);
        initializeUI();
    };

    return { init };
})(createGameboard, createUIControls);

Game.init();