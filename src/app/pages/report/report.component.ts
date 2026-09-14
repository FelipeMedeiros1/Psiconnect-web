import { Component } from '@angular/core';
import { catchError, combineLatest, Observable, of, startWith, map, shareReplay, tap } from 'rxjs';
import { AttendanceHistory, SessionService } from 'src/app/services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { FormControl } from '@angular/forms';
import { Psychologist, PsychologistService } from 'src/app/services/psychologist.service';
import { Router } from '@angular/router';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {
  readonly displayedColumns = ['data', 'paciente', 'psicologo', 'historico', 'acoes'];
  readonly history$: Observable<AttendanceHistory[]>;
  readonly psychologists$: Observable<Psychologist[]>;
  readonly patients$: Observable<Patient[]>;
  readonly summary$: Observable<{ quantidade: number; valorTotal: number }>;
  readonly psychologistControl = new FormControl(0, { nonNullable: true });
  readonly patientControl = new FormControl(0, { nonNullable: true });
  private psychologists: Psychologist[] = [];
  private patients: Patient[] = [];

  constructor(
    service: SessionService,
    psychologistService: PsychologistService,
    patientService: PatientService,
    search: SearchService,
    private dialog: MatDialog,
    private router: Router
  ) {
    const completeHistory$ = service.history().pipe(catchError(() => of([])));
    this.psychologists$ = psychologistService.list().pipe(
      catchError(() => of([])),
      tap((psychologists) => this.psychologists = psychologists),
      shareReplay(1)
    );
    this.patients$ = patientService.list().pipe(
      catchError(() => of([])),
      tap((patients) => this.patients = patients),
      shareReplay(1)
    );
    this.history$ = combineLatest([
      completeHistory$,
      this.psychologistControl.valueChanges.pipe(startWith(0)),
      this.patientControl.valueChanges.pipe(startWith(0)),
      search.query$,
    ]).pipe(
      map(([history, psychologistId, patientId, query]) => history.filter((item) =>
        (!psychologistId || item.psicologoId === psychologistId) &&
        (!patientId || item.pacienteId === patientId) &&
        search.matches(query, item.paciente, item.psicologo, item.historico,
          item.valorSessao, new Date(item.data).toLocaleString('pt-BR'))
      )),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.summary$ = this.history$.pipe(map((history) => ({
      quantidade: history.length,
      valorTotal: history.reduce((total, item) => total + Number(item.valorSessao || 0), 0),
    })));
  }

  prontuario(item: AttendanceHistory): string {
    return item.historico.split(/\r?\n/, 1)[0];
  }

  visualizarEvolucao(item: AttendanceHistory): void {
    const linhas = item.historico.split(/\r?\n/);
    const prontuario = linhas.shift() ?? '';
    const evolucoes: string[] = [];
    const inicioRegistro = /^\d{2}\/\d{2}\/\d{4}(?: \d{2}:\d{2})? - /;
    linhas.forEach((linha) => {
      if (inicioRegistro.test(linha) || evolucoes.length === 0) {
        evolucoes.push(linha);
      } else {
        evolucoes[evolucoes.length - 1] += `\n${linha}`;
      }
    });
    this.dialog.open(ModalComponent, {
      width: '600px',
      data: {
        prontuario,
        paciente: item.paciente,
        evolucao: evolucoes.reverse().join('\n\n') || 'Nenhuma evolução registrada.',
      },
    });
  }

  repetirAtendimento(item: AttendanceHistory): void {
    this.router.navigate(['/appointment/include'], {
      queryParams: {
        pacienteId: item.pacienteId,
        psicologoId: item.psicologoId,
        valorSessao: item.valorSessao,
      },
    });
  }

  gerarRelatorio(): void {
    setTimeout(() => window.print());
  }

  selectedPsychologistName(): string {
    const id = this.psychologistControl.value;
    return id ? this.psychologists.find((item) => item.id === id)?.nome ?? 'Psicólogo não encontrado' : 'Todos os psicólogos';
  }

  selectedPatientName(): string {
    const id = this.patientControl.value;
    return id ? this.patients.find((item) => item.id === id)?.nome ?? 'Paciente não encontrado' : 'Todos os pacientes';
  }
}
