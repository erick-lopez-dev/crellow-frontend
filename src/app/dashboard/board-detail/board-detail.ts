// dashboard/board-detail/board-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardService } from '../services/board.service';
import { ListService } from '../services/list.service';
import { CardService } from '../services/card.service';
import { Subscription } from 'rxjs';
import { FullBoard, List, Card } from './types/fullboard';
import { ListDialog, ListDialogData } from '../components/list-dialog/list-dialog';
import { CardDialog, CardDialogData } from '../components/card-dialog/card-dialog';
import { ConfirmDialog } from '../components/confirm-dialog/confirm-dialog';
import { InviteDialog, InviteDialogData } from '../components/invite-dialog/invite-dialog';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    DragDropModule
  ],
  templateUrl: './board-detail.html',
  styleUrls: ['./board-detail.scss']
})
export class BoardDetail implements OnInit, OnDestroy {
  board: FullBoard | null = null;
  isLoading = true;
  dropListIds: string[] = [];
  errorMessage: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private listService: ListService,
    private cardService: CardService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      const boardId = params['id'];
      this.isLoading = true;
      this.board = null;
      this.dropListIds = [];
      this.errorMessage = null;
      this.refreshBoard(boardId);
    });
  }

  refreshBoard(boardId: string) {
    this.boardService.getFullBoard(boardId, boardId).subscribe({
      next: (data: FullBoard) => {
        data.lists.sort((a, b) => a.position - b.position);
        data.lists.forEach(list => {
          list.cards.sort((a, b) => a.position - b.position);
        });
        this.board = data;
        this.dropListIds = data.lists.map(list => `list-${list._id}`);
        this.isLoading = false;
        console.log('Board loaded:', data);
      },
      error: (err) => {
        console.error('Error loading board:', err);
        this.errorMessage = err.error?.message || 'Failed to load board';
        if (err.status === 404) {
          this.errorMessage = 'Board not found. It may have been deleted.';
          this.router.navigate(['/boards'], { queryParams: { error: 'Board not found' } });
        } else if (err.status === 403) {
          this.errorMessage = 'You do not have access to this board.';
          this.router.navigate(['/boards'], { queryParams: { error: 'Access denied' } });
        }
        this.isLoading = false;
      }
    });
  }

  createList() {
    const dialogRef = this.dialog.open(ListDialog, {
      width: '400px',
      data: { title: '', mode: 'create' } as ListDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        const position = this.board.lists.length;
        this.listService.createList({ title: result.title, boardId: this.board._id, position }, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error creating list:', err);
            this.errorMessage = err.error?.message || 'Failed to create list';
          }
        });
      }
    });
  }

  editList(list: List) {
    const dialogRef = this.dialog.open(ListDialog, {
      width: '400px',
      data: { title: list.title, mode: 'edit' } as ListDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        this.listService.updateList(list._id, { title: result.title }, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error updating list:', err);
            this.errorMessage = err.error?.message || 'Failed to update list';
          }
        });
      }
    });
  }

  deleteList(list: List) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '300px',
      data: { message: `Are you sure you want to delete the list "${list.title}"? This will also delete all cards in it.` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        console.log(`Attempting to delete list: ${list._id} from board: ${this.board._id}`);
        this.listService.deleteList(list._id, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error deleting list:', err);
            this.errorMessage = err.error?.message || 'Failed to delete list';
            console.log('Error details:', {
              listId: list._id,
              boardId: this.board!._id,
              error: err.error
            });
            if (err.status === 404 && err.error?.message === 'Board not found') {
              this.router.navigate(['/boards'], { queryParams: { error: 'Board not found' } });
            } else if (err.status === 403) {
              this.errorMessage = 'You do not have access to this board.';
              this.router.navigate(['/boards'], { queryParams: { error: 'Access denied' } });
            }
          }
        });
      }
    });
  }

  createCard(list: List) {
    const dialogRef = this.dialog.open(CardDialog, {
      width: '400px',
      data: { title: '', description: '', dueDate: null, mode: 'create' } as any
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        const position = list.cards.length;
        const dueDate = result.dueDate ? result.dueDate.toISOString() : undefined;
        this.cardService.createCard({
          title: result.title,
          description: result.description,
          listId: list._id,
          dueDate,
          position
        }, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error creating card:', err);
            this.errorMessage = err.error?.message || 'Failed to create card';
          }
        });
      }
    });
  }

  editCard(list: List, card: Card) {
    const dialogRef = this.dialog.open(CardDialog, {
      width: '400px',
      data: {
        title: card.title,
        description: card.description,
        dueDate: card.dueDate ? new Date(card.dueDate) : null,
        mode: 'edit'
      } as CardDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        const dueDate = result.dueDate ? result.dueDate.toISOString() : undefined;
        this.cardService.updateCard(card._id, {
          title: result.title,
          description: result.description,
          dueDate,
        }, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error updating card:', err);
            this.errorMessage = err.error?.message || 'Failed to update card';
          }
        });
      }
    });
  }

  deleteCard(list: List, card: Card) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '300px',
      data: { message: `Are you sure you want to delete the card "${card.title}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.board) {
        console.log(`Attempting to delete card: ${card._id} from board: ${this.board._id}`);
        this.cardService.deleteCard(card._id, this.board._id).subscribe({
          next: () => this.refreshBoard(this.board!._id),
          error: (err) => {
            console.error('Error deleting card:', err);
            this.errorMessage = err.error?.message || 'Failed to delete card';
            console.log('Error details:', {
              cardId: card._id,
              boardId: this.board!._id,
              error: err.error
            });
            if (err.status === 404) {
              if (err.error?.message === 'Board not found') {
                this.errorMessage = 'Board not found. It may have been deleted.';
                this.router.navigate(['/boards'], { queryParams: { error: 'Board not found' } });
              } else if (err.error?.message === 'Card not found') {
                this.errorMessage = 'Card not found. It may have been deleted.';
                this.refreshBoard(this.board!._id); // Refresh to sync state
              } else if (err.error?.message === 'List not found') {
                this.errorMessage = 'List not found. It may have been deleted.';
                this.refreshBoard(this.board!._id);
              }
            } else if (err.status === 403) {
              this.errorMessage = 'You do not have access to this board.';
              this.router.navigate(['/boards'], { queryParams: { error: 'Access denied' } });
            }
          }
        });
      }
    });
  }

  dropList(event: CdkDragDrop<List[]>) {
    if (this.board) {
      moveItemInArray(this.board.lists, event.previousIndex, event.currentIndex);
      this.board.lists.forEach((list, index) => {
        list.position = index;
      });
      const orders = this.board.lists.map(list => ({
        listId: list._id,
        position: list.position
      }));
      this.boardService.updateListOrder(this.board._id, orders).subscribe({
        next: () => console.log('List positions updated'),
        error: (err) => {
          console.error('Error updating list positions:', err);
          this.errorMessage = err.error?.message || 'Failed to update list positions';
        }
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
        next: () => console.log('Card positions updated'),
        error: (err) => {
          console.error('Error updating card positions:', err);
          this.errorMessage = err.error?.message || 'Failed to update card positions';
        }
      });
    }
  }
  openInviteDialog() {
    if (!this.board) return;
    const dialogRef = this.dialog.open(InviteDialog, {
      width: '400px',
      data: { boardId: this.board._id } as InviteDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Invitation sent');
      }
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}