// src/app/services/list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { List } from '../board-detail/types/fullboard'; // Adjust path as needed
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createList(data: { title: string, boardId: string, position: number }, boardId: string): Observable<List> {
    return this.http.post<List>(`${this.apiUrl}/lists`, data, { params: { boardId } });
  }

  updateList(listId: string, data: { title: string }, boardId: string): Observable<List> {
    return this.http.patch<List>(`${this.apiUrl}/lists/${listId}`, data, { params: { boardId } });
  }

  deleteList(listId: string, boardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lists/${listId}`, { params: { boardId } });
  }
}