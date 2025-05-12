import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameData } from '../../../models/gameData.model';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})


export class SidebarComponent {
  subscription!: Subscription;
  games: GameData[] = [];
  isOpen = false;
  networkError: boolean = false;
  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.getGameState().subscribe({
      next: (response: GameData[]) => {
        this.games = response;
      },
      error: (err) => {
        this.networkError = true;
      }
    });
  }

  deleteGame(game: GameData) {
    this.gameService.deleteGameState(game.id).subscribe({
      next: () => {
        this.games = this.games.filter(g => g !== game);
      },
      error: (err) => {
        console.error('Error in deleting game:', err);
      }
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}