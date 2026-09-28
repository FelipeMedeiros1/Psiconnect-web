import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, startWith } from 'rxjs';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { ErrorDialogComponent } from 'src/app/shared/error-dialog/error-dialog.component';
import { SearchService } from 'src/app/services/search.service';
import { DischargeDialogComponent } from 'src/app/shared/discharge-dialog/discharge-dialog.component';
import { PatientDetailsDialogComponent } from 'src/app/shared/patient-details-dialog/patient-details-dialog.component';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
})
export class PatientComponent implements OnInit {
  patiens$: Observable<Patient[]>;
  expandedPatient: Patient | null = null;
  patientDetails = new Map<number, Patient>();
  loadingDetails = new Set<number>();
  detailErrors = new Set<number>();

  displayedColumns = ['id', 'nome', 'actions'];
  readonly statusControl = new FormControl<'ativos' | 'inativos' | 'todos'>('ativos', { nonNullable: true });

  constructor(
    private patientService: PatientService,
    private router: Router,
    public dialog: MatDialog,
    private search: SearchService
  ) {
    this.patiens$ = combineLatest([
      this.patientService.list().pipe(catchError((error) => {
        this.onError('Não foi possível carregar os dados');
        return of([]);
      })),
      this.search.query$,
      this.statusControl.valueChanges.pipe(startWith('ativos' as const)),
    ]).pipe(map(([patients, query, status]) => patients.filter((patient) =>
      (status === 'todos' || (status === 'ativos' ? patient.status === true : patient.status === false)) &&
      this.search.matches(query, patient.id, patient.nome, patient.cpf,
        patient.email, patient.contato?.email, patient.telefone, patient.contato?.telefone, patient.idade,
        patient.profissao, patient.status ? 'ativo' : 'inativo')
    )));
  }

  onError(errorMessage: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMessage,
    });
  }

  ngOnInit(): void {}

  onAdd() {
    this.router.navigate(['patient/include']);
  }


  onView(patient: Patient): void {
    if (patient.id == null) {
      this.openPatientDetails(patient);
      return;
    }

    this.patientService.findById(patient.id).subscribe({
      next: (details) => this.openPatientDetails({ ...patient, ...details, idade: patient.idade }),
      error: () => this.onError('Não foi possível carregar as informações do paciente'),
    });
  }

  private openPatientDetails(patient: Patient): void {
    this.dialog.open(PatientDetailsDialogComponent, {
      width: '460px',
      maxWidth: '92vw',
      data: patient,
    });
  }
  onEdit(patient: Patient): void {
    this.router.navigate(['patient/edit', patient.id]);
  }

  onDeactivate(patient: Patient): void {
    if (!patient.id || !patient.status) return;
    const motivo = window.prompt('Informe o motivo da inativação do paciente:');
    if (!motivo?.trim()) return;

    this.patientService.deactivate(patient.id, motivo.trim()).subscribe({
      next: () => (this.patiens$ = this.patientService.list()),
      error: () => this.onError('Não foi possível inativar o paciente'),
    });
  }

  onDischarge(patient: Patient): void {
    if (!patient.id || !patient.status) return;
    this.dialog.open(DischargeDialogComponent, {
      width: '560px', data: { paciente: patient.nome },
    }).afterClosed().subscribe((motivo?: string) => {
      if (!motivo) return;
      this.patientService.discharge(patient.id!, motivo).subscribe({
        next: () => window.location.reload(),
        error: () => this.onError('Não foi possível registrar a alta do paciente'),
      });
    });
  }

  onReactivate(patient: Patient): void {
    if (!patient.id || patient.status) return;
    if (!window.confirm(`Reativar ${patient.nome}?`)) return;
    this.patientService.reactivate(patient.id).subscribe({
      next: () => window.location.reload(),
      error: () => this.onError('Não foi possível reativar o paciente'),
    });
  }
  toggleDetails(patient: Patient) {
    if (this.expandedPatient === patient) {
      this.expandedPatient = null;
      return;
    }

    this.expandedPatient = patient;

    if (
      patient.id != null &&
      !patient.telefone &&
      !patient.contato?.telefone &&
      !this.patientDetails.has(patient.id) &&
      !this.loadingDetails.has(patient.id)
    ) {
      this.loadDetails(patient.id);
    }
  }

  getPatientDetails(patient: Patient): Patient {
    return patient.id != null
      ? this.patientDetails.get(patient.id) || patient
      : patient;
  }

  private loadDetails(id: number) {
    this.loadingDetails.add(id);
    this.detailErrors.delete(id);

    this.patientService.findById(id).subscribe({
      next: (patient) => {
        this.patientDetails.set(id, patient);
        this.loadingDetails.delete(id);
      },
      error: (error) => {
        console.error('Não foi possível carregar os detalhes.', error);
        this.loadingDetails.delete(id);
        this.detailErrors.add(id);
      },
    });
  }

  getEmail(patient: Patient): string {
    return patient.email || patient.contato?.email || 'Não informado';
  }

  getPhone(patient: Patient): string {
    return patient.telefone || patient.contato?.telefone || 'Não informado';
  }

  formatPhone(patient: Patient): string {
    const phone = this.getPhone(patient).replace(/\D/g, '');
    if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    return this.getPhone(patient);
  }
  getStatus(patient: Patient): string {
    if (typeof patient.status === 'string') {
      return patient.status;
    }

    if (patient.status == null) {
      return 'Não informado';
    }

    return patient.status ? 'Ativo' : 'Inativo';
  }
}
