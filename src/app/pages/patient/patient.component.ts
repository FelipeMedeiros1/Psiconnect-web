import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { ErrorDialogComponent } from 'src/app/shared/error-dialog/error-dialog.component';

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

  displayedColumns = ['id', 'status', 'nome', 'email', 'cpf', 'actions'];

  constructor(
    private patientService: PatientService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.patiens$ = this.patientService.list().pipe(
      catchError((error) => {
        this.onError('Não foi possível carregar os dados');
        return of([]);
      })
    );
  }

  onError(errorMessage: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMessage,
    });
  }

  ngOnInit(): void {}

  onAdd() {
    this.router.navigate(['patient/include']);
    console.log('onAdd');
  }

  onEdit(patient: Patient, event: Event) {
    event.stopPropagation();

    if (patient.id == null) {
      this.onError('Não foi possível identificar o paciente');
      return;
    }

    this.router.navigate(['/patient/edit', patient.id], {
      state: { patient },
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
