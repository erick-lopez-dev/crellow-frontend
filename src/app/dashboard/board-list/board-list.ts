import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router } from '@angular/router';
import { BoardService } from '../services/board.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  createdAt: string;
}

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, MatListModule, RouterModule, RouterModule],
  templateUrl: './board-list.html',
  styleUrls: ['./board-list.scss']
})
export class BoardList implements OnInit {
  @Output() boardClicked = new EventEmitter<void>();
  boards$!: Observable<Board[]>;
  errorMessage: string | null = null;

  constructor(private boardService: BoardService, private router: Router) {}

  ngOnInit() {
    this.boards$ = this.boardService.getUserBoards().pipe(
      catchError(error => {
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again';
        } else {
          this.errorMessage = error.message || 'Error fetching boards';
        }
        console.error('Board fetch error:', error);
        return of([]);
      })
    );
  }

  onBoardClick(board: Board) {
  console.log('Board recibido:', board);
  console.log('ID:', board._id);
  this.router.navigate(['/dashboard/boards', board._id]);
}

}