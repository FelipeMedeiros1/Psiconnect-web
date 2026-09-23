import { Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, Observable, of, startWith, map, shareReplay, tap } from 'rxjs';
import { AttendanceHistory, SessionService } from 'src/app/services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { FormControl } from '@angular/forms';
import { Psychologist, PsychologistService } from 'src/app/services/psychologist.service';
import { Router } from '@angular/router';
import { DischargeHistory, Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { SearchService } from 'src/app/services/search.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {
  readonly displayedColumns = ['data', 'paciente', 'psicologo', 'historico', 'acoes'];
  readonly history$: Observable<AttendanceHistory[]>;
  readonly visibleHistory$: Observable<AttendanceHistory[]>;
  readonly pagedHistory$: Observable<AttendanceHistory[]>;
  readonly visibleHistoryCount$: Observable<number>;
  readonly historyPageSize = 10;
  readonly psychologists$: Observable<Psychologist[]>;
  readonly patients$: Observable<Patient[]>;
  readonly discharges$: Observable<DischargeHistory[]>;
  readonly summary$: Observable<{ quantidade: number; valorTotal: number }>;
  readonly psychologistControl = new FormControl(0, { nonNullable: true });
  readonly patientControl = new FormControl(0, { nonNullable: true });
  readonly startDateControl = new FormControl<Date | null>(null);
  readonly endDateControl = new FormControl<Date | null>(null);
  private psychologists: Psychologist[] = [];
  private patients: Patient[] = [];
  private readonly historyPage = new BehaviorSubject(0);

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
    this.discharges$ = combineLatest([
      patientService.dischargeHistory().pipe(catchError(() => of([]))),
      this.patientControl.valueChanges.pipe(startWith(0)),
      search.query$,
    ]).pipe(map(([items, patientId, query]) => items.filter((item) =>
      (!patientId || item.pacienteId === patientId) &&
      search.matches(query, item.paciente, item.motivo, item.usuario, new Date(item.data).toLocaleString('pt-BR'))
    )));
    this.history$ = combineLatest([
      completeHistory$,
      this.psychologistControl.valueChanges.pipe(startWith(0)),
      this.patientControl.valueChanges.pipe(startWith(0)),
      this.startDateControl.valueChanges.pipe(startWith(null)),
      this.endDateControl.valueChanges.pipe(startWith(null)),
      search.query$,
    ]).pipe(
      map(([history, psychologistId, patientId, startDate, endDate, query]) => history.filter((item) =>
        (!psychologistId || item.psicologoId === psychologistId) &&
        (!patientId || item.pacienteId === patientId) &&
        this.isWithinPeriod(item.data, startDate, endDate) &&
        search.matches(query, item.paciente, item.psicologo, item.historico,
          item.valorSessao, new Date(item.data).toLocaleString('pt-BR'))
      )),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.visibleHistory$ = this.history$.pipe(map((history) => {
      const groups = new Map<string, { item: AttendanceHistory; records: string[]; seen: Set<string> }>();
      [...history]
        .sort((first, second) => new Date(first.data).getTime() - new Date(second.data).getTime())
        .forEach((item) => {
          const key = item.pacienteId + ':' + this.prontuario(item);
          let group = groups.get(key);
          if (!group) {
            group = { item, records: [], seen: new Set<string>() };
            groups.set(key, group);
          }
          group.item = item;
          const record = this.registroDaEvolucao(item);
          if (record && !group.seen.has(record)) {
            group.seen.add(record);
            group.records.push(record);
          }
        });

      return [...groups.values()]
        .map(({ item, records }) => ({ ...item, evolucao: [...records].reverse().join('\n\n') }))
        .sort((first, second) => new Date(second.data).getTime() - new Date(first.data).getTime());
    }), shareReplay({ bufferSize: 1, refCount: true }));
    this.visibleHistoryCount$ = this.visibleHistory$.pipe(map((history) => history.length));
    this.pagedHistory$ = combineLatest([this.visibleHistory$, this.historyPage]).pipe(
      map(([history, page]) => history.slice(page * this.historyPageSize, (page + 1) * this.historyPageSize))
    );
    this.summary$ = this.history$.pipe(map((history) => ({
      quantidade: history.length,
      valorTotal: history.reduce((total, item) => total + Number(item.valorSessao || 0), 0),
    })));
  }

  private isWithinPeriod(value: string, startDate: Date | null, endDate: Date | null): boolean {
    const appointment = new Date(value).getTime();
    const start = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
      : Number.NEGATIVE_INFINITY;
    const end = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime()
      : Number.POSITIVE_INFINITY;
    return appointment >= start && appointment <= end;
  }
  onHistoryPage(event: PageEvent): void {
    this.historyPage.next(event.pageIndex);
  }
  prontuario(item: AttendanceHistory): string {
    return item.historico.split(/\r?\n/, 1)[0];
  }

  private registroDaEvolucao(item: AttendanceHistory): string {
    const data = new Date(item.data);
    const dataAtendimento = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(data).replace(',', '');
    return item.evolucao?.trim()
      ? dataAtendimento + ' - ' + item.psicologo + ' - ' + item.evolucao.trim()
      : '';
  }
  visualizarEvolucao(item: AttendanceHistory): void {
    this.dialog.open(ModalComponent, {
      width: '600px',
      data: {
        prontuario: this.prontuario(item),
        paciente: item.paciente,
        evolucao: item.evolucao || 'Nenhuma evolução registrada.',
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
