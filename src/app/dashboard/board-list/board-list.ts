// Updated: board-list/board-list.component.ts (re-added click event handling with router navigation)
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BoardService, Board } from '../services/board.service';
import { BoardDialog, BoardDialogData } from '../components/board-dialog/board-dialog';
import { ConfirmDialog } from '../components/confirm-dialog/confirm-dialog';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatMenuModule, MatButtonModule, RouterModule],
  template: `
    <mat-list>
      <mat-list-item *ngFor="let board of boards$ | async" (click)="onBoardClick(board)">
        <span matListItemTitle class="board-title">{{ board.title }}</span>
        <button mat-icon-button [matMenuTriggerFor]="menu" class="menu-button" (click)="$event.stopPropagation()">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="$event.stopPropagation(); editBoard(board)">Edit</button>
          <button mat-menu-item (click)="$event.stopPropagation(); deleteBoard(board)">Delete</button>
        </mat-menu>
      </mat-list-item>
    </mat-list>
    <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
  `,
  styles: [
    `.board-title { flex: 1; }`,
    `.menu-button { margin-left: auto; }`,
    `mat-list-item { cursor: pointer; }`,
    `.error-message { color: red; padding: 16px; }`
  ]
})
export class BoardList implements OnInit {
  @Output() boardClicked = new EventEmitter<void>();
  boards$!: Observable<Board[]>;
  errorMessage: string | null = null;

  constructor(
    private boardService: BoardService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.boardService.refreshBoards();
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
    this.boardClicked.emit();
  }

  editBoard(board: Board) {
    const dialogRef = this.dialog.open(BoardDialog, {
      width: '400px',
      data: { title: board.title, description: board.description, mode: 'edit' } as BoardDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.updateBoard(board._id, { title: result.title, description: result.description }, board._id).subscribe();
      }
    });
  }

  deleteBoard(board: Board) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '300px',
      data: { message: `Are you sure you want to delete the board "${board.title}"? This action cannot be undone.` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.deleteBoard(board._id, board._id).subscribe();
      }
    });
  }
}