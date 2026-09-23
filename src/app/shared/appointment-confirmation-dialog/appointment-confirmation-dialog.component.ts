import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AppointmentConfirmationData {
  numeroProntuario: string;
  paciente: string;
  data: string;
}

@Component({
  selector: 'app-appointment-confirmation-dialog',
  templateUrl: './appointment-confirmation-dialog.component.html',
})
export class AppointmentConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: AppointmentConfirmationData) {}
}
