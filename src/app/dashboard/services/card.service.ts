// Updated: dashboard/services/card.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { Card } from '../board-detail/types/fullboard';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  createCard(data: { title: string; description?: string; listId: string; dueDate?: string; position: number; boardId: string }): Observable<Card> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(response => ({
        _id: response.id, // Map 'id' to '_id'
        title: response.title,
        description: response.description,
        listId: response.listId,
        members: response.members || [],
        labelIds: response.labelIds || [],
        dueDate: response.dueDate,
        position: response.position,
        createdAt: response.createdAt
      })),
      catchError(error => {
        console.error('Error creating card:', error);
        throw error;
      })
    );
  }

  updateCard(cardId: string, data: { title: string; description?: string; dueDate?: string; boardId: string }): Observable<Card> {
    return this.http.patch<any>(`${this.apiUrl}/${cardId}`, data).pipe(
      map(response => ({
        _id: response.id,
        title: response.title,
        description: response.description,
        listId: response.listId,
        members: response.members || [],
        labelIds: response.labelIds || [],
        dueDate: response.dueDate,
        position: response.position,
        createdAt: response.createdAt
      })),
      catchError(error => {
        console.error('Error updating card:', error);
        throw error;
      })
    );
  }

  deleteCard(cardId: string, boardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`, { params: { boardId } }).pipe(
      catchError(error => {
        console.error('Error deleting card:', error);
        throw error;
      })
    );
  }
}