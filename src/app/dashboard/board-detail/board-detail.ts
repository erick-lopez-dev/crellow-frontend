// board-detail/board-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardService } from '../services/board.service';
import { Subscription } from 'rxjs';
import { FullBoard, List, Card } from './types/fullboard';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatChipsModule, DragDropModule],
  templateUrl: './board-detail.html',
  styleUrls: ['./board-detail.scss']
})
export class BoardDetail implements OnInit, OnDestroy {
  board: FullBoard | null = null;
  isLoading = true;
  dropListIds: string[] = []; // Initialize as empty array to avoid undefined
  private subscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      const boardId = params['id'];

      this.isLoading = true;
      this.board = null;
      this.dropListIds = []; // Reset to ensure no stale IDs

      this.boardService.getFullBoard(boardId).subscribe({
        next: (data: FullBoard) => {
          // Sort lists and cards by position
          data.lists.sort((a, b) => a.position - b.position);
          data.lists.forEach(list => {
            list.cards.sort((a, b) => a.position - b.position);
          });
          this.board = data;
          this.dropListIds = data.lists.map(list => `list-${list._id}`);
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

  dropList(event: CdkDragDrop<List[]>) {
    if (this.board) {
      moveItemInArray(this.board.lists, event.previousIndex, event.currentIndex);
      // Update list positions
      this.board.lists.forEach((list, index) => {
        list.position = index;
      });
      const orders = this.board.lists.map(list => ({
        listId: list._id,
        position: list.position
      }));
      this.boardService.updateListOrder(this.board._id, orders).subscribe({
        next: () => console.log('Posiciones de lists actualizadas'),
        error: (err) => console.error('Error actualizando positions de lists:', err)
      });
    }
  }

  dropCard(event: CdkDragDrop<Card[]>) {
    const previousContainer = event.previousContainer;
    const container = event.container;

    if (previousContainer === container) {
      moveItemInArray(container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        previousContainer.data,
        container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update affected lists
    const affectedCardsArrays = [container.data];
    if (previousContainer !== container) {
      affectedCardsArrays.push(previousContainer.data);
    }

    const cardOrders: { cardId: string, listId: string, position: number }[] = [];
    affectedCardsArrays.forEach(cards => {
      const list = this.board?.lists.find(l => l.cards === cards);
      if (list) {
        cards.forEach((card, index) => {
          card.listId = list._id;
          card.position = index;
          cardOrders.push({
            cardId: card._id,
            listId: card.listId,
            position: card.position
          });
        });
      }
    });

    if (this.board && cardOrders.length > 0) {
      this.boardService.updateCardOrder(this.board._id, cardOrders).subscribe({
        next: () => console.log('Posiciones de cards actualizadas'),
        error: (err) => console.error('Error actualizando positions de cards:', err)
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}