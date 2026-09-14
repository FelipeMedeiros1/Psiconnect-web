import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-time-picker-dialog',
  templateUrl: './time-picker-dialog.component.html',
  styleUrls: ['./time-picker-dialog.component.scss'],
})
export class TimePickerDialogComponent {
  readonly hours = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly minutes = Array.from({ length: 12 }, (_, index) => index * 5);
  step: 'hour' | 'minute' = 'hour';
  hour = 12;
  minute = 0;
  period: 'AM' | 'PM' = 'AM';

  constructor(
    @Inject(MAT_DIALOG_DATA) currentTime: string,
    private dialogRef: MatDialogRef<TimePickerDialogComponent>
  ) {
    const [hours, minutes] = (currentTime || '00:00').split(':').map(Number);
    this.period = hours >= 12 ? 'PM' : 'AM';
    this.hour = hours % 12 || 12;
    this.minute = Number.isFinite(minutes) ? minutes : 0;
  }

  position(value: number, type: 'hour' | 'minute'): { left: string; top: string } {
    const index = type === 'hour' ? value % 12 : value / 5;
    const angle = index * 30 * Math.PI / 180;
    return { left: `${50 + 40 * Math.sin(angle)}%`, top: `${50 - 40 * Math.cos(angle)}%` };
  }

  selectHour(hour: number): void {
    this.hour = hour;
    this.step = 'minute';
  }

  confirm(): void {
    let hour = this.hour % 12;
    if (this.period === 'PM') hour += 12;
    this.dialogRef.close(`${String(hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`);
  }
}
