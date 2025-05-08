import { CdkDrag, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Player, GameService, Piece, Position } from '../../services/game.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopUpComponent } from '../../shared/pop-up/pop-up.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, DragDropModule, PopUpComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  boardSize = 8;
  board = signal<(Piece | null)[][]>([]);

  validSizes: { rows: number; cols: number }[] = [
    { rows: 6, cols: 6 },
    { rows: 6, cols: 8 },
    { rows: 6, cols: 12 },
    { rows: 12, cols: 12 },
    { rows: 10, cols: 7 },
  ];
  selectedPiece = signal<{ x: number, y: number, piece: Piece } | undefined>(undefined);
  validMoves = signal<Position[]>([]);
  cellSize = 60;
  rows: number = 8;
  cols: number = 8;
  dimensionError: boolean = false;
  inputRows: number = 6;
  inputCols: number = 6;
  rowError: string = '';
  colError: string = '';
  currentTurn: string = 'white';
  highlights = signal<boolean[][]>([]);
  showPopup: boolean = false;

  constructor(
    private gameService: GameService,
    private dialog: MatDialog
  ) {
    this.resetBoard(6, 6); // Tamanho inicial
  }

  ngOnInit() {
    this.board.set(this.gameService.getBoard());
  }



  applyBoardSize() {
    this.validateDimensions();
    if (this.dimensionError) return;

    this.changeBoardSize(this.inputRows, this.inputCols);
  }

  validateDimensions() {
    this.dimensionError = false;
    this.rowError = '';
    this.colError = '';

    if (this.inputRows < 6 || this.inputRows > 12) {
      this.rowError = 'As linhas devem estar entre 6 e 12.';
      this.dimensionError = true;
    }

    if (this.inputCols < 6 || this.inputCols > 12) {
      this.colError = 'As colunas devem estar entre 6 e 12.';
      this.dimensionError = true;
    }
  }

  changeBoardSize(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.gameService.resetBoard(rows, cols);
    this.board.set(this.gameService.getBoard());
    this.currentTurn = 'white';
  }


  resetBoard(rows: number, cols: number): void {
    this.rows = rows;
    this.cols = cols;
    this.gameService.resetBoard(rows, cols);
    this.board.set(this.gameService.getBoard());
  }
  isSelected(x: number, y: number): boolean {
    const selected = this.selectedPiece();
    return selected?.x === x && selected?.y === y;
  }
  colsArray(): number[] {
    return Array(this.cols).fill(0).map((_, i) => i);
  }


  onDragStart(x: number, y: number) {
    const piece = this.board()[y][x];

    if (!piece) return;

    this.selectedPiece.set({ x, y, piece });

    const rawBoard = this.board();
    const moves = this.gameService.getValidMoves(piece, x, y, rawBoard, this.rows, this.cols);
    this.validMoves.set(moves);
  }

  getColumnLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }

  clearHighlights() {
    const empty = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
    this.highlights.set(empty);
  }


  toggleTurn() {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
  }

  isHighlighted(x: number, y: number): boolean {
    return this.validMoves().some(pos => pos.x === x && pos.y === y);
  }

  isValidBoardSize(rows: number, cols: number): boolean {
    const allowedSizes = [
      [6, 6], [6, 8], [6, 12], [12, 12], [10, 7]
    ];
    return allowedSizes.some(([r, c]) => r === rows && c === cols);
  }





  getPiecePlayer(piece: Piece | null): string {
    const colorMap: Record<Player, string> = {
      white: '#fff',
      black: '#000',
    };
    return piece ? colorMap[piece.player] : '#bdc3c7'; // fallback cinza
  }


  onDragEnd(event: CdkDragEnd, fromX: number, fromY: number, dragRef: CdkDrag<any>) {
    const pieceRect = event.source.getRootElement().getBoundingClientRect();

    // Ponto central da peça
    const centerX = pieceRect.left + pieceRect.width / 2;
    const centerY = pieceRect.top + pieceRect.height / 2;

    let targetX = -1;
    let targetY = -1;

    const cells = document.querySelectorAll('.cell');
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

    // Se nenhuma célula válida foi encontrada, volta
    if (targetX === -1 || targetY === -1) {
      dragRef.reset();
      return;
    }

    // Verifica se é movimento válido
    const isValid = this.validMoves().some(pos => pos.x === targetX && pos.y === targetY);
    if (!isValid) {
      dragRef.reset();
      return;
    }

    // Atualiza o board lógico
    const boardCopy = this.board().map(row => [...row]);
    const piece = boardCopy[fromY][fromX];
    if (!piece) {
      dragRef.reset();
      return;
    }

    boardCopy[fromY][fromX] = null;
    boardCopy[targetY][targetX] = piece;
    this.board.set(boardCopy);

    // Limpa estados
    this.selectedPiece.set(undefined);
    this.validMoves.set([]);
    this.clearHighlights();
    this.toggleTurn();
    dragRef.reset(); // Reposiciona visualmente
  }


}
