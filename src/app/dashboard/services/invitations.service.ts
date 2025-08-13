// src/app/dashboard/services/invitations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Invitation {
  id: string;
  boardId: string;
  boardTitle: string;
  invitedBy: string;
  invitedByUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) {}

  createInvitation(boardId: string, invitedUserEmail: string): Observable<Invitation> {
    return this.http.post<Invitation>(this.apiUrl, { boardId, invitedUserEmail });
  }

  getMyInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  updateInvitation(id: string, status: 'accepted' | 'rejected'): Observable<Invitation> {
    return this.http.patch<Invitation>(`${this.apiUrl}/${id}`, { status });
  }

  deleteInvitation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}