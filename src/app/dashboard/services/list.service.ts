// Updated: dashboard/services/list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { List } from '../board-detail/types/fullboard';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  createList(data: { title: string; boardId: string; position: number }): Observable<List> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(response => ({
        _id: response.id, // Map 'id' from response to '_id' for frontend
        title: response.title,
        boardId: response.boardId,
        position: response.position,
        createdAt: response.createdAt,
        cards: [] // Initialize empty cards array for new list
      })),
      catchError(error => {
        console.error('Error creating list:', error);
        throw error;
      })
    );
  }

  updateList(listId: string, data: { title: string; boardId: string }): Observable<List> {
    return this.http.patch<any>(`${this.apiUrl}/${listId}`, data).pipe(
      map(response => ({
        _id: response.id,
        title: response.title,
        boardId: response.boardId,
        position: response.position,
        createdAt: response.createdAt,
        cards: [] // Cards not returned in update response, will be refreshed
      })),
      catchError(error => {
        console.error('Error updating list:', error);
        throw error;
      })
    );
  }

  deleteList(listId: string, boardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${listId}`, { params: { boardId } }).pipe(
      catchError(error => {
        console.error('Error deleting list:', error);
        throw error;
      })
    );
  }
}