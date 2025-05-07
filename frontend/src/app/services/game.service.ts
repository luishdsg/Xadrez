import { Injectable } from "@angular/core";

export type PieceType = 'developer' | 'designer' | 'product-owner';
export type Player = 'white' | 'black';
export type Color = 'red' | 'blue';

export interface Piece {
  type: PieceType;
  player?: Player;
  color: Color;
  symbol: string;
}

export interface Position {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  isValidPosition(pos: Position, board: (Piece | null)[][]): boolean {
    return (
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.x < board.length &&
      pos.y < board[0].length &&
      !board[pos.y][pos.x] // casa deve estar vazia para alguns movimentos
    );
  }

  getValidMoves(piece: Piece, x: number, y: number, board: (Piece | null)[][]): Position[] {
    switch (piece.type) {
      case 'developer':
        return this.getDeveloperMoves(x, y, piece, board);
      case 'designer':
        return this.getDesignerMoves(x, y, piece, board);
      case 'product-owner':
        return this.getProductOwnerMoves(x, y, piece, board);
    }
  }

  private getDeveloperMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1],
    ];

    for (const [dx, dy] of directions) {
      for (let step = 1; step <= 3; step++) {
        const nx = x + dx * step;
        const ny = y + dy * step;

        if (nx < 0 || ny < 0 || nx >= board[0].length || ny >= board.length) break;

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

  private getDesignerMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [1, 2], [2, 1], [-1, 2], [-2, 1],
      [1, -2], [2, -1], [-1, -2], [-2, -1],
    ];

    for (const [dx, dy] of knightMoves) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < board[0].length && ny < board.length) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    return moves;
  }

  private getProductOwnerMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1],
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < board[0].length && ny < board.length) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    return moves;
  }
}
