// Updated: services/board.service.ts (adjusted interface to use 'id', added error handling if needed, but mainly same)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { FullBoard } from '../board-detail/types/fullboard';

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  createdAt: string;
  members?: { userId: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/boards`;
  private boardsSubject = new BehaviorSubject<Board[]>([]);

  constructor(private http: HttpClient) {}

  getUserBoards(): Observable<Board[]> {
    return this.boardsSubject.asObservable();
  }

  refreshBoards(): void {
    this.http.get<Board[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching boards:', error);
        throw error;
      })
    ).subscribe(boards => {
      this.boardsSubject.next(boards);
    });
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching board:', error);
        throw error;
      })
    );
  }

  getFullBoard(id: string): Observable<FullBoard> {
    return this.http.get<FullBoard>(`${this.apiUrl}/${id}/full`);
  }

  createBoard(data: { title: string; description?: string }): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, data).pipe(
      tap(() => this.refreshBoards()),
      catchError(error => {
        console.error('Error creating board:', error);
        throw error;
      })
    );
  }

  updateBoard(id: string, data: { title: string; description?: string }): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.refreshBoards()),
      catchError(error => {
        console.error('Error updating board:', error);
        throw error;
      })
    );
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshBoards()),
      catchError(error => {
        console.error('Error deleting board:', error);
        throw error;
      })
    );
  }

  // Existing methods for orders
  updateListOrder(boardId: string, orders: { listId: string, position: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${boardId}/lists/order`, { orders }).pipe(
      catchError(error => {
        console.error('Error updating list order:', error);
        throw error;
      })
    );
  }

  updateCardOrder(boardId: string, orders: { cardId: string, listId: string, position: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${boardId}/cards/order`, { orders }).pipe(
      catchError(error => {
        console.error('Error updating card order:', error);
        throw error;
      })
    );
  }
}