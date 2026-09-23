import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({ selector: 'app-discharge-dialog', templateUrl: './discharge-dialog.component.html', styleUrls: ['./discharge-dialog.component.scss'] })
export class DischargeDialogComponent {
  readonly motivo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(600)] });
  constructor(@Inject(MAT_DIALOG_DATA) public data: { paciente: string }, private dialogRef: MatDialogRef<DischargeDialogComponent>) {}
  salvar(): void {
    this.motivo.markAsTouched();
    if (this.motivo.invalid || !this.motivo.value.trim()) return;
    this.dialogRef.close(this.motivo.value.trim());
  }
}
