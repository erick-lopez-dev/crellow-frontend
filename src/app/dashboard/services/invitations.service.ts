// src/app/dashboard/services/invitations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Invitation {
  _id: string;
  boardId: string;
  invitedUserEmail: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  // Assuming backend populates these for display; otherwise, fetch separately
  boardTitle?: string;
  invitedByUsername?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl =  `${environment.apiUrl}/invitations` ;

  constructor(private http: HttpClient) {}

  createInvitation(boardId: string, invitedUserEmail: string): Observable<Invitation> {
    return this.http.post<Invitation>(this.apiUrl, { boardId, invitedUserEmail });
  }

  getMyInvitations(): Observable<Invitation[]> {
    // Assumes GET /api/invitations returns pending invitations for the current user
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  updateInvitation(id: string, status: 'accepted' | 'rejected'): Observable<Invitation> {
    return this.http.patch<Invitation>(`${this.apiUrl}/${id}`, { status });
  }
}