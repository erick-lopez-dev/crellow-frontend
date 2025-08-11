// Updated: dashboard/dashboard.component.ts
import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BoardList } from './board-list/board-list'; // Updated import
import { AuthService } from '../auth/auth.service';
import { BoardService } from './services/board.service';
import { BoardDialog, BoardDialogData } from './components/board-dialog/board-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    BoardList
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;

  constructor(
    private observer: BreakpointObserver,
    private authService: AuthService,
    private dialog: MatDialog,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    this.observer.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  toggleSidebar() {
    this.sidenav.toggle();
  }

  closeIfMobile() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      error: (err) => console.error('Logout failed', err)
    });
  }

  openCreateBoardDialog() {
    const dialogRef = this.dialog.open(BoardDialog, {
      width: '400px',
      data: { title: '', description: '', mode: 'create' } as BoardDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.createBoard({ title: result.title, description: result.description }).subscribe();
      }
    });
  }
}