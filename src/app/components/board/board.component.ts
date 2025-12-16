import { CdkDrag, CdkDragEnd, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GameData } from '../../models/gameData.model';
import { Piece } from '../../models/piece.model';
import { Position } from '../../models/position.model';
import { GameService } from '../../services/game.service';
import { PopUpComponent } from '../../shared/components/pop-up/pop-up.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, DragDropModule, SidebarComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  canStartGame = false;
  gameStarted = false;
  boardSize = 8;
  board = signal<(Piece | null)[][]>([]);
  selectedPiece = signal<{ x: number, y: number, piece: Piece } | undefined>(undefined);
  validMoves = signal<Position[]>([]);
  rows: number = 6;
  cols: number = 6;
  dimensionError: boolean = false;
  inputRows: number = 6;
  inputCols: number = 6;
  previousPosition: { x: number; y: number; } | undefined;
  lastMovedCell?: { x: number; y: number; };
  lastTargetCell?: { x: number; y: number; };
  rowError: string = '';
  colError: string = '';
  currentTurn: string = 'white';
  highlights = signal<boolean[][]>([]);
  moveWarning: string | null = null;

  constructor(
    private gameService: GameService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.resetBoard(6, 6);
    this.board.set(this.gameService.getBoard());
  }

  startGame() {
    this.canStartGame = false;
    this.gameStarted = true;
    this.resetBoard(this.rows, this.cols);
    this.currentTurn = 'white';
  }

  applyBoardSize() {
    this.resetBoard(this.inputRows, this.inputCols);
    console.log('Board size:', this.rows, 'x', this.cols);
    this.canStartGame = true;
  }


  validateDimensions() {
    const isValid = (value: number) => value >= 6 && value <= 12;
    this.dimensionError = !isValid(this.inputRows) || !isValid(this.inputCols);
    this.rowError = !isValid(this.inputRows) ? 'Please use values between 6 - 12.' : '';
    this.colError = !isValid(this.inputCols) ? 'Please use values between 6 - 12.' : '';
  }

getPieceImage(piece: Piece){
  const color = piece.player === 'black' ? 'black' : 'white';
  return `./icons/${color}${piece.type}.png`;
} 

  resetBoard(rows: number, cols: number): void {
    this.rows = rows;
    this.cols = cols;
    this.gameService.resetBoard(rows, cols);
    this.board.set(this.gameService.getBoard());
    this.currentTurn = 'white';
    const boardSetup = this.board().map((row, y) =>
      row.map((piece) => {
        if (piece) {
          piece.player = y < rows / 2 ? 'black' : 'white';
        }
        return piece;
      })
    );
    this.board.set(boardSetup);
  }


  restrictToNumbers(event: KeyboardEvent) {
    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }


  onDragStarted(event: CdkDragStart<any>) {
    this.previousPosition = { x: event.source.getRootElement().getBoundingClientRect().x, y: event.source.getRootElement().getBoundingClientRect().y };
  }


  onDragStart(x: number, y: number) {
    const piece = this.board()[y][x];
    if (!piece) return;
    if (piece.player !== this.currentTurn) {
      this.moveWarning = `It's the ${this.currentTurn === 'white' ? 'white' : 'black'} pieces' turn.`;
      return;
    }
    this.moveWarning = null;
    this.selectedPiece.set({ x, y, piece });
    const rawBoard = this.board();
    const moves = this.gameService.getValidMoves(piece, x, y, rawBoard, this.rows, this.cols);
    this.validMoves.set(moves);
  }


  onDragEnd(event: CdkDragEnd, fromX: number, fromY: number, dragRef: CdkDrag<any>) {
    const pieceRect = event.source.getRootElement().getBoundingClientRect();
    const centerX = pieceRect.left + pieceRect.width / 2;
    const centerY = pieceRect.top + pieceRect.height / 2;

    let targetX = -1;
    let targetY = -1;

    const cells = document.querySelectorAll('.cell-table');
    cells.forEach((cell: Element, index: number) => {
      const rect = cell.getBoundingClientRect();
      if (
        centerX >= rect.left &&
        centerX <= rect.right &&
        centerY >= rect.top &&
        centerY <= rect.bottom
      ) {
        const y = Math.floor(index / this.cols);
        const x = index % this.cols;
        targetX = x;
        targetY = y;
      }
    });

    if (targetX === -1 || targetY === -1) {
      dragRef.reset();
      return;
    }

    const piece = this.board()[fromY][fromX];
    if (!piece || piece.player !== this.currentTurn) {
      dragRef.reset();
      return;
    }

    const isValid = this.validMoves().some(pos => pos.x === targetX && pos.y === targetY);
    if (!isValid) {
      dragRef.reset();
      return;
    }
    this.lastMovedCell = { x: fromX, y: fromY };
    this.lastTargetCell = { x: targetX, y: targetY };
    setTimeout(() => {
      this.lastMovedCell = undefined;
      this.lastTargetCell = undefined;
      this.board.set([...this.board()]);
    }, 1000);
    const boardCopy = this.board().map(row => [...row]);
    const targetPiece = boardCopy[targetY][targetX];
    if (targetPiece && targetPiece.player !== piece.player) {
      if (targetPiece.type === 'productowner') {
        const gameData: GameData = {
          id: new Date().getTime().toString(),
          type: piece.type,
          time: new Date(),
          winner: piece.player === 'white' ? 'white' : 'black',
        };

        this.gameService.saveGameState(gameData).subscribe(response => {
          const dialogRef = this.dialog.open(PopUpComponent, {
            data: {
              player: piece.player,
              type: piece.type
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result === 'restart') {
              this.startGame();
            }
          });
        }, error => {
          console.error('Erro game not save:', error);
        });
      }
    }
    boardCopy[fromY][fromX] = null;
    boardCopy[targetY][targetX] = piece;
    this.board.set(boardCopy);
    this.selectedPiece.set(undefined);
    this.validMoves.set([]);
    this.clearHighlights();
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
  }

  clearHighlights() {
    const empty = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
    this.highlights.set(empty);
  }

  getCellClass(x: number, y: number): string {
    return (x + y) % 2 === 0 ? 'white' : 'black';
  }

  isHighlighted(x: number, y: number): boolean {
    return this.validMoves().some(pos => pos.x === x && pos.y === y);
  }

  getColumnLabel(index: number): string {
    return String.fromCharCode(97 + index);
  }

  isSelected(x: number, y: number): boolean {
    const selected = this.selectedPiece();
    return selected?.x === x && selected?.y === y;
  }
}
