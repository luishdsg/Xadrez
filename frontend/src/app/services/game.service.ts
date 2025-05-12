import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, signal, WritableSignal } from "@angular/core";
import { catchError, Observable, retryWhen, switchMap, throwError, timer } from "rxjs";
import { environment } from "../../environments/environment";
import { GameData } from "../models/gameData.model";
import { PieceType } from "../models/piceType.model";
import { Piece } from "../models/piece.model";
import { Position } from "../models/position.model";




@Injectable({ providedIn: 'root' })
export class GameService {
  private rows = 6;
  private cols = 6;
  private apiUrl = environment.apiUrl
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
      board[0][0] = { type: 'developer', player: 'White' };
      // Black na última linha
      board[this.rows - 1][this.cols - 3] = { type: 'developer', player: 'Black' };
      board[this.rows - 1][this.cols - 2] = { type: 'developer', player: 'Black' };
      board[this.rows - 1][this.cols - 1] = { type: 'product-owner', player: 'Black' };
    }

    return board;
  }

  private getDeveloperMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
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

  private getDesignerMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [1, 2], [2, 1], [-1, 2], [-2, 1],
      [1, -2], [2, -1], [-1, -2], [-2, -1],
    ];
    for (const [dx, dy] of knightMoves) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
    return moves;
  }

  private getProductOwnerMoves(x: number, y: number, piece: Piece, board: (Piece | null)[][], rows: number, cols: number): Position[] {
    const moves: Position[] = [];
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1],
      [0, 1], [-1, 1], [-1, 0], [-1, -1],
    ];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        const target = board[ny][nx];
        if (!target || target.player !== piece.player) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
    return moves;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error('Could not connect to the server. Please check the connection.' + error.message));
  }

  private placePieces(board: (Piece | null)[][]): void {
    const pieceTypes: PieceType[] = ['product-owner', 'developer', 'designer'];
    const lastCol = board[0].length - 1;
    for (let i = 0; i < pieceTypes.length; i++) {
      board[0][lastCol - i] = {
        type: pieceTypes[i],
        player: 'Black',
      };
    }
    const lastRow = board.length - 1;
    for (let i = 0; i < pieceTypes.length; i++) {
      board[lastRow][i] = {
        type: pieceTypes[i],
        player: 'White',
      };
    }
  }

  constructor(private http: HttpClient) { }

  saveGameState(gameData: GameData): Observable<any> {
    return this.http.post(this.apiUrl, gameData);
  }

  getGameState(): Observable<GameData[]> {
    return this.http.get<GameData[]>(this.apiUrl).pipe(
      retryWhen(errors =>
        errors.pipe(
          switchMap((error, attempt) => {
            if (attempt >= 9) throw error;
            return timer(2000);
          })
        )
      ),
      catchError(this.handleError)
    );
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

  resetBoard(rows: number, cols: number): void {
    const newBoard: (Piece | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );
    this.placePieces(newBoard);
    this.board.set(newBoard);
  }

  deleteGameState(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getBoard(): (Piece | null)[][] {
    return this.board();
  }
}