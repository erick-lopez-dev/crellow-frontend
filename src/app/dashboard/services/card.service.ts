// src/app/services/card.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../board-detail/types/fullboard'; // Adjust path as needed
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createCard(data: { title: string, description?: string, listId: string, dueDate?: string, position: number }, boardId: string): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards`, data, { params: { boardId } });
  }

  updateCard(cardId: string, data: { title: string, description?: string, dueDate?: string }, boardId: string): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/cards/${cardId}`, data, { params: { boardId } });
  }

  deleteCard(cardId: string, boardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`, { params: { boardId } });
  }
}