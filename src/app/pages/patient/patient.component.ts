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
}
