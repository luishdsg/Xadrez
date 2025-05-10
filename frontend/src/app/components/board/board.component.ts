import { CdkDrag, CdkDragEnd, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Player, GameService, Piece, Position } from '../../services/game.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopUpComponent } from '../../shared/components/pop-up/pop-up.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  canStartGame = false;
  gameStarted = false;
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
  showPopup: boolean = false;
  moveWarning: string | null = null;
  historic: any;

  constructor(
    private gameService: GameService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.resetBoard(6, 6); // Tamanho inicial
    this.rows = 6;
    this.cols = 6;
    this.board.set(this.gameService.getBoard());
    this.gameService.getGameState().subscribe(response => {
      console.log('Estado do jogo recebido:', response);
      // this.board.set(response);
    });
  }

  startGame() {
    this.canStartGame = false;
    this.gameStarted = true;
    this.resetBoard(this.rows, this.cols);
    this.currentTurn = 'white'; // <- Certo, começa com as brancas
  }


  applyBoardSize() {
    this.changeBoardSize(this.inputRows, this.inputCols);
    this.canStartGame = true;
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
  getCellClass(x: number, y: number): string {
    // // Estilo temporário da origem
    // if (this.lastMovedCell?.x === x && this.lastMovedCell?.y === y) {
    //   return (x + y) % 2 === 0 ? 'cell.black-moved' : 'cell.white-moved';
    // }

    // // Estilo temporário do destino
    // if (this.lastTargetCell?.x === x && this.lastTargetCell?.y === y) {
    //   return (x + y) % 2 === 0 ? 'cell.black-moved' : 'cell.white-moved';
    // }

    return (x + y) % 2 === 0 ? 'white' : 'black';
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

    if (piece.player !== this.currentTurn) {
      this.moveWarning = `É a vez das peças ${this.currentTurn === 'white' ? 'brancas' : 'pretas'}.`;
      return;
    }

    this.moveWarning = null; // limpa o aviso se estiver tudo certo
    this.selectedPiece.set({ x, y, piece });
    const rawBoard = this.board();
    const moves = this.gameService.getValidMoves(piece, x, y, rawBoard, this.rows, this.cols);
    this.validMoves.set(moves);
  }



  getColumnLabel(index: number): string {
    return String.fromCharCode(97 + index); // a, b, c, ...
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


  getCornerClass(x: number, y: number): string {
    const lastRow = this.rows - 1;
    const lastCol = this.cols - 1;

    if (x === 0 && y === 0) return 'top-left-corner';
    if (x === lastCol && y === 0) return 'top-right-corner';
    if (x === 0 && y === lastRow) return 'bottom-left-corner';
    if (x === lastCol && y === lastRow) return 'bottom-right-corner';

    return '';
  }


 restrictToNumbers(event: KeyboardEvent) {
    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  getPiecePlayer(piece: Piece | null): string {
    const colorMap: Record<Player, string> = {
      white: '#fff',
      black: '#000',
    };
    return piece ? colorMap[piece.player] : '#bdc3c7'; // fallback cinza
  }

  onDragStarted(event: CdkDragStart<any>) {
    this.previousPosition = { x: event.source.getRootElement().getBoundingClientRect().x, y: event.source.getRootElement().getBoundingClientRect().y };
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
    // Determina se as células são pretas
    this.lastMovedCell = { x: fromX, y: fromY };
    this.lastTargetCell = { x: targetX, y: targetY };

    setTimeout(() => {
      this.lastMovedCell = undefined;
      this.lastTargetCell = undefined;
      this.board.set([...this.board()]); // força re-renderização
    }, 1000);



    const boardCopy = this.board().map(row => [...row]);
    const targetPiece = boardCopy[targetY][targetX];
    if (targetPiece && targetPiece.player !== piece.player) {
      console.log(`Peça capturada: ${targetPiece.type} (${targetPiece.player}) na posição (${targetX}, ${targetY})`);

      // Checa se é um product-owner
      if (targetPiece.type === 'product-owner') {
        // this.gameService.saveGameState(this.board()).subscribe(response => {
        //   alert('Jogo salvo com sucesso!');
        // });
        this.dialog.open(PopUpComponent, {
          data: {
            player: piece.player,
            type: piece.type
          }
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

}
