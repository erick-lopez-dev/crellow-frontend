// src/app/dashboard/components/invitationsList.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvitationService, Invitation } from '../../services/invitations.service';

@Component({
  selector: 'app-invitations-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: './invitations-list.html',
  styleUrls: ['./invitations-list.scss']
})
export class InvitationsList implements OnInit {
  @Input() invitations: Invitation[] = [];
  @Input() isLoading: boolean = true;
  @Input() errorMessage: string | null = null;
  @Output() invitationUpdated = new EventEmitter<void>(); // Emit event to notify parent of updates

  constructor(private invitationService: InvitationService) {}

  ngOnInit() {
    // Use input data; no need to fetch here
  }

  acceptInvitation(id: string) {
    this.invitationService.updateInvitation(id, 'accepted').subscribe({
      next: () => {
        this.invitationUpdated.emit(); // Notify parent to refresh data
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to accept invitation';
      }
    });
  }

  rejectInvitation(id: string) {
    this.invitationService.updateInvitation(id, 'rejected').subscribe({
      next: () => {
        this.invitationUpdated.emit(); // Notify parent to refresh data
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reject invitation';
      }
    });
  }
}