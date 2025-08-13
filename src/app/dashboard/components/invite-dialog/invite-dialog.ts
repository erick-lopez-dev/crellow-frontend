// src/app/dashboard/components/invite-dialog/invite-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../services/invitations.service';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';

export interface InviteDialogData {
  boardId: string;
}

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,MatDialogContent, MatDialogActions],
  templateUrl: './invite-dialog.html',
  styleUrls: ['./invite-dialog.scss']
})
export class InviteDialog {
  email: string = '';
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<InviteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData,
    private invitationService: InvitationService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (!this.email) {
      this.errorMessage = 'Email is required';
      return;
    }
    this.invitationService.createInvitation(this.data.boardId, this.email).subscribe({
      next: (invitation) => {
        this.dialogRef.close(invitation);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send invitation';
      }
    });
  }
}