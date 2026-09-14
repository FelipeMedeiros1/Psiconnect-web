import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EvolutionFormDialogData {
  title: string;
  patient: string;
  evolution?: string;
}

@Component({
  selector: 'app-evolution-form-dialog',
  templateUrl: './evolution-form-dialog.component.html',
  styleUrls: ['./evolution-form-dialog.component.scss'],
})
export class EvolutionFormDialogComponent {
  readonly maxLength = 600;
  readonly evolution = new FormControl(this.data.evolution ?? '', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(this.maxLength)],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EvolutionFormDialogData,
    private dialogRef: MatDialogRef<EvolutionFormDialogComponent>
  ) {}

  confirm(): void {
    const value = this.evolution.value.trim();
    if (!value || this.evolution.invalid) {
      this.evolution.markAsTouched();
      return;
    }
    this.dialogRef.close(value);
  }
}
