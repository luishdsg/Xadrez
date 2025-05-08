import { Injectable, signal, WritableSignal } from "@angular/core";
import { Subject } from "rxjs";

export type PieceType = 'developer' | 'designer' | 'product-owner';
export type Player = 'white' | 'black';

export interface Piece {
  type: PieceType; 
  player: Player;
  symbol?: string;
}

export interface Position {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private rows = 6;
  private cols = 6;
  captureEvent: Subject<{capturedBy: PieceType, player: Player}> = new Subject();
  private board: WritableSignal<(Piece | null)[][]> = signal(this.createInitialBoard());

  private createInitialBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = [];
  
    for (let y = 0; y < this.rows; y++) {
      const row: (Piece | null)[] = [];
      for (let x = 0; x < this.cols; x++) {
        row.push(null);
      }
      board.push(row);
    }
  
    // Verifica se há espaço suficiente para colocar as peças sem erro
    if (this.cols >= 3) {
      // RED na primeira linha
      board[0][0] = { type: 'developer', player: 'white' };
      board[0][1] = { type: 'developer', player: 'white' };
      board[0][2] = { type: 'product-owner', player: 'white' };
  
      // black na última linha
      board[this.rows - 1][this.cols - 3] = { type: 'developer', player: 'black' };
      board[this.rows - 1][this.cols - 2] = { type: 'developer', player: 'black' };
      board[this.rows - 1][this.cols - 1] = { type: 'product-owner', player: 'black' };
    }
  
    return board;
  }

  getBoard(): (Piece | null)[][] {
    return this.board();
  }

  resetBoard(rows: number, cols: number): void {
    const newBoard: (Piece | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );
  
    this.placePieces(newBoard); // coloca 3 peças fixas de cada lado
    this.board.set(newBoard); // atualiza o signal
  }
  

  private placePieces(board: (Piece | null)[][]): void {
    const pieceTypes: PieceType[] = ['developer', 'designer', 'product-owner'];
  
    // Coloca as peças vermelhas na linha 0
    for (let i = 0; i < pieceTypes.length; i++) {
      board[0][i] = {
        type: pieceTypes[i],
        player: 'white',
      };
    }
  
    // Coloca as peças azuis na última linha
    const lastRow = board.length - 1;
    for (let i = 0; i < pieceTypes.length; i++) {
      board[lastRow][i] = {
        type: pieceTypes[i],
        player: 'black',
      };
    }
  }
  

  getValidMoves(piece: Piece, x: number, y: number, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    switch (piece.type) {
      case 'developer':
        return this.getDeveloperMoves(x, y, piece, board, rows, cols);
      case 'designer':
        return this.getDesignerMoves(x, y, piece, board, rows, cols);
      case 'product-owner':
        return this.getProductOwnerMoves(x, y, piece, board, rows, cols);
    }
  }
  

  private getDeveloperMoves (x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    const moves: Position[] = [];
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1],
    ];
  
    for (const [dx, dy] of directions) {
      for (let step = 1; step <= 3; step++) {
        const nx = x + dx * step;
        const ny = y + dy * step;
  
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) break;
  
        const target = board[ny][nx];
  
        if (!target) {
          moves.push({ x: nx, y: ny });
        } else if (target.player !== piece.player) {
          if (step === 1 || (step > 1 && !board[ny - dy][nx - dx])) {
            moves.push({ x: nx, y: ny });
          }
          break;
        } else break;
      }
    }
  
    return moves;
  }
  

  private getDesignerMoves (x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [1, 2], [2, 1], [-1, 2], [-2, 1],
      [1, -2], [2, -1], [-1, -2], [-2, -1],
    ];

    for (const [dx, dy] of knightMoves) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    return moves;
  }

  private getProductOwnerMoves (x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    const moves: Position[] = [];
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1],
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    return moves;
  }
}