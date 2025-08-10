// board-detail.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { BoardService } from '../services/board.service';
import { Subscription } from 'rxjs';
import { FullBoard } from './types/fullboard';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './board-detail.html',
  styleUrls: ['./board-detail.scss']
})
export class BoardDetail implements OnInit, OnDestroy {
  board: FullBoard | null = null;
  isLoading = true;
  private subscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      const boardId = params['id'];

      // Reset estado para evitar mostrar datos viejos mientras carga
      this.isLoading = true;
      this.board = null;

      this.boardService.getFullBoard(boardId).subscribe({
        next: (data: FullBoard) => {
          this.board = data;
          this.isLoading = false;
          console.log('Board cargado:', data);
        },
        error: (err) => {
          console.error('Error cargando board:', err);
          this.isLoading = false;
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
