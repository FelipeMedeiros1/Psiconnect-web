import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Psychologist } from 'src/app/services/psychologist.service';

@Component({
  selector: 'app-psychologist-details-dialog',
  templateUrl: './psychologist-details-dialog.component.html',
  styleUrls: ['./psychologist-details-dialog.component.scss'],
})
export class PsychologistDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public psychologist: Psychologist) {}

  get telefone(): string {
    const value = this.psychologist.contato?.telefone;
    if (!value) return 'Não informado';
    const phone = value.replace(/\D/g, '');
    if (phone.length === 11) return '(' + phone.slice(0, 2) + ') ' + phone.slice(2, 7) + '-' + phone.slice(7);
    if (phone.length === 10) return '(' + phone.slice(0, 2) + ') ' + phone.slice(2, 6) + '-' + phone.slice(6);
    return value;
  }
}