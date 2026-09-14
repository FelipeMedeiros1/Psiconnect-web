import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { Psychologist, PsychologistService } from 'src/app/services/psychologist.service';
import { SessionRegistration, SessionService } from 'src/app/services/session.service';
import { TimePickerDialogComponent } from 'src/app/shared/time-picker-dialog/time-picker-dialog.component';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {
  readonly specialties = ['INFANTIL', 'ADOLECENTE', 'ADULTO', 'CASAL', 'FAMILIAR'];
  patients: Patient[] = [];
  psychologists: Psychologist[] = [];
  loading = true;
  saving = false;
  editId: number | null = null;
  private originalPatientId: number | null = null;
  private originalPsychologistId: number | null = null;
  readonly minimumDate = new Date(new Date().setHours(0, 0, 0, 0));

  readonly form = this.formBuilder.group({
    idPaciente: [0, [Validators.required, Validators.min(1)]],
    idPsicologo: [0],
    especialidade: [''],
    dataConsulta: [null as unknown as Date, Validators.required],
    horario: ['', Validators.required],
    valorSessao: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private formBuilder: NonNullableFormBuilder,
    private patientService: PatientService,
    private psychologistService: PsychologistService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.editId = id;

    forkJoin({
      patients: this.patientService.list(),
      psychologists: this.psychologistService.list(),
    }).subscribe({
      next: ({ patients, psychologists }) => {
        this.patients = patients.filter((patient) => patient.status !== false);
        this.psychologists = psychologists.filter((psychologist) => psychologist.ativo);
        this.loading = false;
        if (this.editId) {
          this.loadSession(this.editId);
        } else {
          this.loadRepeatedSession();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Não foi possível carregar pacientes e psicólogos.', '', {
          duration: 5000,
        });
      },
    });
  }

  onSubmit(): void {
    const data = this.form.getRawValue();
    const patientId = data.idPaciente || this.originalPatientId;
    const psychologistId = data.idPsicologo || this.originalPsychologistId;
    if (patientId && !data.idPaciente) this.form.controls.idPaciente.setValue(patientId);
    if (psychologistId && !data.idPsicologo) this.form.controls.idPsicologo.setValue(psychologistId);

    if (!data.dataConsulta || !data.horario || !patientId) {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha os campos obrigatórios.', '', {
        duration: 5000,
      });
      return;
    }

    if (!psychologistId && !data.especialidade) {
      this.snackBar.open('Selecione um psicólogo ou uma especialidade.', '', { duration: 5000 });
      return;
    }

    const [hours, minutes] = data.horario.split(':').map(Number);
    if (hours < 7 || hours > 22 || (hours === 22 && minutes > 0)) {
      this.form.controls.horario.setErrors({ businessHours: true });
      this.snackBar.open('Selecione um horário entre 07:00 e 22:00.', '', { duration: 5000 });
      return;
    }

    const selectedDate = new Date(data.dataConsulta);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate.getTime() < this.minimumDate.getTime()) {
      this.form.controls.dataConsulta.setErrors({ pastDate: true });
      this.snackBar.open('A data da consulta não pode ser anterior à data atual.', '', { duration: 5000 });
      return;
    }

    const sessionDate = this.combineDateAndTime(data.dataConsulta, data.horario);
    if (new Date(sessionDate).getTime() <= Date.now()) {
      this.form.controls.horario.setErrors({ pastTime: true });
      this.snackBar.open('O horário da consulta deve ser posterior à hora atual.', '', { duration: 5000 });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha os campos obrigatórios corretamente.', '', { duration: 5000 });
      return;
    }

    const request: SessionRegistration = {
      idPaciente: patientId,
      idPsicologo: psychologistId,
      especialidade: psychologistId ? null : data.especialidade,
      data: sessionDate,
      valorSessao: data.valorSessao,
    };

    this.saving = true;
    const saveRequest = this.editId
      ? this.sessionService.update(this.editId, request)
      : this.sessionService.schedule(request);
    saveRequest.subscribe({
      next: () => {
        this.snackBar.open('Sessão agendada com sucesso!', '', { duration: 3000 });
        this.router.navigate(['/appointment']);
      },
      error: (error) => {
        this.saving = false;
        const message = typeof error.error === 'string' ? error.error : 'Erro ao agendar a sessão.';
        this.snackBar.open(message, '', { duration: 5000 });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/appointment']);
  }

  selectValue(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

      openTimePicker(): void {
    const dialog = this.dialog.open(TimePickerDialogComponent, {
      data: this.form.controls.horario.value,
      width: '360px',
    });
    dialog.afterClosed().subscribe((time: string | undefined) => {
      if (time) {
        this.form.controls.horario.setValue(time);
        this.form.controls.horario.setErrors(null);
      }
    });
  }

  onDateChanged(): void {
    const control = this.form.controls.dataConsulta;
    if (control.value) {
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < this.minimumDate.getTime()) {
        control.setErrors({ ...(control.errors ?? {}), pastDate: true });
      }
    }
    this.clearPastTimeError();
  }

  private clearPastTimeError(): void {
    const control = this.form.controls.horario;
    if (!control.hasError('pastTime')) return;
    const errors = { ...control.errors };
    delete errors['pastTime'];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private loadSession(id: number): void {
    this.sessionService.findById(id).subscribe({
      next: (session) => {
        const date = new Date(session.data);
        this.originalPatientId = session.idPaciente ?? null;
        this.originalPsychologistId = session.idPsicologo ?? null;
        this.form.patchValue({
          idPaciente: this.originalPatientId ?? 0,
          idPsicologo: this.originalPsychologistId ?? 0,
          dataConsulta: date,
          horario: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          valorSessao: session.valorSessao ?? 0,
        });
      },
      error: () => this.snackBar.open('Não foi possível carregar a consulta.', '', { duration: 5000 }),
    });
  }

  private loadRepeatedSession(): void {
    const pacienteId = Number(this.route.snapshot.queryParamMap.get('pacienteId'));
    const psicologoId = Number(this.route.snapshot.queryParamMap.get('psicologoId'));
    const valorSessao = Number(this.route.snapshot.queryParamMap.get('valorSessao'));
    if (!pacienteId || !psicologoId) return;

    this.originalPatientId = pacienteId;
    this.originalPsychologistId = psicologoId;
    this.form.patchValue({
      idPaciente: pacienteId,
      idPsicologo: psicologoId,
      valorSessao: Number.isFinite(valorSessao) ? valorSessao : 0,
      dataConsulta: null as unknown as Date,
      horario: '',
    });
  }

  private combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const localDate = new Date(date);
    localDate.setHours(hours, minutes, 0, 0);
    const offset = localDate.getTimezoneOffset();
    return new Date(localDate.getTime() - offset * 60000).toISOString().slice(0, 19);
  }
}
