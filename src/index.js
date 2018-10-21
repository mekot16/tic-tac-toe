import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={"square " + (props.isWinner+1 ? "winning-square" : "")} onClick={props.onClick}>
            {props.value}
        </button>
    );
}
  
class Board extends React.Component {
    renderSquare(i) {
        const isWinner = this.props.winLine.find((item) => item === i);
        return (
                <Square 
                    key={i}
                    value={this.props.squares[i]}
                    isWinner={isWinner}
                    onClick={() => this.props.onClick(i)}
                />
        );
    }

    render() {
        let board = [];
        for (let i=0; i<3; i++) {
            let row = [];
            for (let j=0; j<3; j++) {
                row.push(this.renderSquare(i*3+j));
            }
            board.push(<div key={i} className="board-row">{row}</div>);
        }

        return (
            <div>
                {board}
            </div>
        );
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            historyDesc: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    findChange(move) {
        const history = this.state.history;
        const current = history[move].squares;
        if (move) {
            const prev = history[move-1].squares;
            for (let i=0; i<current.length; i++) {
                if (current[i] !== prev[i]) {
                    return {row:Math.floor(i/3), col:i%3}
                }
            }
        }
        return null;
    }

    handleToggleClick() {
        this.setState({historyDesc: !this.state.historyDesc});
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const winLine = winner && winner.player ? winner.line : [];

        const moves = history.map((step, move) => {
            const pos = this.findChange(move);
            const desc = move ?
                'Go to move #' + move + " - player: '" + (move%2 === 0 ? 'X' : 'O') + "' - row: " + (pos.row+1) + ", col: " + (pos.col+1) :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {this.state.stepNumber === move ? <strong>{desc}</strong> : desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner && winner.player) {
            status = 'Winner: ' + winner.player;
        } else if (winner && winner.draw) {
            status = 'Draw: No available moves';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        winLine={winLine}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>
                        {status}&nbsp;&nbsp;
                        <button onClick={() => this.handleToggleClick()}>Show {this.state.historyDesc ? "Asc" : "Desc"}</button>
                    </div>

                    <ol>{this.state.historyDesc ? moves.reverse() : moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    let isDraw = true;
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {player:squares[a], line:[a,b,c]};
        }
        if (squares[a] === null) {
            isDraw = false;
        }
    }
    return isDraw ? {draw:true} : null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
