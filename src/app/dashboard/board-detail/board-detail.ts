import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { BoardService } from '../services/board.service';
import { Observable } from 'rxjs';

interface Board {
  id: string;
  title: string;
  description?: string;
  owner: string;
  members: { userId: string }[];
  createdAt: string;
}

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './board-detail.html',
  styleUrls: ['./board-detail.scss']
})
export class BoardDetail implements OnInit {
  board$!: Observable<Board>;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    const boardId = this.route.snapshot.paramMap.get('id')!;
    this.board$ = this.boardService.getBoard(boardId);
  }
}