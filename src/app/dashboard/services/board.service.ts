// services/board.service.ts (added methods for updating orders)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { FullBoard } from '../board-detail/types/fullboard';

interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/boards`;

  constructor(private http: HttpClient) {}

  getUserBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching boards:', error);
        throw error;
      })
    );
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

  // Nuevo: Actualizar orden de lists
  updateListOrder(boardId: string, orders: { listId: string, position: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${boardId}/lists/order`, { orders }).pipe(
      catchError(error => {
        console.error('Error updating list order:', error);
        throw error;
      })
    );
  }

  // Nuevo: Actualizar orden de cards (incluye cambio de listId si aplica)
  updateCardOrder(boardId: string, orders: { cardId: string, listId: string, position: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${boardId}/cards/order`, { orders }).pipe(
      catchError(error => {
        console.error('Error updating card order:', error);
        throw error;
      })
    );
  }
}