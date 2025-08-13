// src/app/dashboard/components/invitationNotification.ts
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvitationService, Invitation } from '../../services/invitations.service';
import { InvitationsList } from '../invitations-list/invitations-list';

@Component({
  selector: 'app-invitation-notification',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, InvitationsList],
  templateUrl: './invitation-notification.html',
  styleUrls: ['./invitation-notification.scss']
})
export class InvitationNotification implements OnInit {
  invitations: Invitation[] = [];
  errorMessage: string | null = null;
  isLoading = true;

  constructor(
    private invitationService: InvitationService,
    public dialogRef: MatDialogRef<InvitationNotification>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.isLoading = true;
    this.invitationService.getMyInvitations().subscribe({
      next: (invitations) => {
        this.invitations = invitations;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load invitations';
        this.isLoading = false;
      }
    });
  }

  closeNotification() {
    this.dialogRef.close();
  }

  onInvitationUpdated() {
    this.loadInvitations(); // Refresh data when an invitation is updated
  }
}