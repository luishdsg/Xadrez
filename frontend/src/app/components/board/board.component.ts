import { Component, OnInit, signal } from '@angular/core';
import { GameService, Piece, Position } from '../../services/game.service';
import { PieceComponent } from '../piece/piece.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';


interface Cell {
  piece: Piece | null;
  highlight: boolean;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, PieceComponent, NgFor, NgIf, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent {
  boardSize = 8;
  board = signal<(Piece | null)[][]>(this.createInitialBoard());
  selectedPiece = signal<{ x: number, y: number, piece: Piece } | null>(null);
  validMoves = signal<Position[]>([]);
  cellSize = 60;

  
  constructor(private gameService: GameService) { }

  createInitialBoard(): (Piece | null)[][] {
    const grid = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(null)
    );

    grid[0][0] = { type: 'product-owner', player: 'black' };
    grid[7][7] = { type: 'product-owner', player: 'white' };
    grid[0][1] = { type: 'developer', player: 'black' };
    grid[7][6] = { type: 'developer', player: 'white' };
    grid[0][2] = { type: 'designer', player: 'black' };
    grid[7][5] = { type: 'designer', player: 'white' };

    return grid;
  }

  onDragStart(x: number, y: number) {
    const piece = this.board()[y][x];
    if (!piece) return;
    this.selectedPiece.set({ x, y, piece });
    const moves = this.gameService.getValidMoves(piece, x, y, this.board());
    this.validMoves.set(moves);
  }
  clearHighlights() {
    this.selectedPiece.set(null);
    this.validMoves.set([]);
  }

  isHighlighted(x: number, y: number): boolean {
    return this.validMoves().some(pos => pos.x === x && pos.y === y);
  }

  onDragEnd(event: CdkDragEnd, fromX: number, fromY: number, dragRef: CdkDrag<any>) {
    const dropX = Math.floor(event.dropPoint.x / this.cellSize);
    const dropY = Math.floor(event.dropPoint.y / this.cellSize);

    const isValid = this.validMoves().some(pos => pos.x === dropX && pos.y === dropY);
    if (!isValid) {
      dragRef.reset(); // Retorna à posição original
      return;
    }

    const board = this.board().map(row => [...row]);
    const piece = board[fromY][fromX];
    board[fromY][fromX] = null;
    board[dropY][dropX] = piece;

    this.board.set(board);
    this.selectedPiece.set(null);
    this.validMoves.set([]);

    dragRef.reset(); // 🔥 Reseta a posição visual da peça no DOM
  }
}