import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Patient } from 'src/app/model/patient';

@Component({
  selector: 'app-patient-details-dialog',
  templateUrl: './patient-details-dialog.component.html',
  styleUrls: ['./patient-details-dialog.component.scss'],
})
export class PatientDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public patient: Patient) {}

  get prontuario(): string {
    return this.patient.numeroProntuario || String(this.patient.id ?? 'Não informado');
  }

  get telefone(): string {
    const value = this.patient.telefone || this.patient.contato?.telefone;
    if (!value) return 'Não informado';

    const phone = value.replace(/\D/g, '');
    if (phone.length === 11) return '(' + phone.slice(0, 2) + ') ' + phone.slice(2, 7) + '-' + phone.slice(7);
    if (phone.length === 10) return '(' + phone.slice(0, 2) + ') ' + phone.slice(2, 6) + '-' + phone.slice(6);
    return value;
  }

  get idade(): string {
    if (this.patient.idade != null) return this.patient.idade + ' anos';
    if (!this.patient.dataNascimento) return 'Não informada';

    const birthDate = new Date(this.patient.dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age--;
    return age + ' anos';
  }

  get localAtendimento(): string {
    return this.patient.localAtendimento?.nomeLugar || 'Não definido';
  }
}