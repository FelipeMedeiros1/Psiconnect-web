import { Component } from '@angular/core';
import { catchError, combineLatest, map, Observable, of } from 'rxjs';
import { Session, SessionService } from 'src/app/services/session.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EvolutionFormDialogComponent } from 'src/app/shared/evolution-form-dialog/evolution-form-dialog.component';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent {
  readonly displayedColumns = ['data', 'psicologo', 'paciente', 'actions'];
  sessions$: Observable<Session[]>;

  constructor(private service: SessionService, private router: Router, private dialog: MatDialog, private search: SearchService) {
    this.sessions$ = this.load();
  }

  onAdd(): void {
    this.router.navigate(['/appointment/include']);
  }

  onEdit(session: Session): void {
    this.router.navigate(['/appointment/edit', session.id]);
  }

  onDelete(session: Session): void {
    if (!window.confirm('Excluir esta consulta?')) return;
    this.service.delete(session.id).subscribe({
      next: () => (this.sessions$ = this.load()),
    });
  }

  onConfirmAttendance(session: Session): void {
    if (session.compareceu) return;
    const dialog = this.dialog.open(EvolutionFormDialogComponent, {
      width: '700px',
      data: { title: 'Concluir atendimento', patient: session.paciente },
    });
    dialog.afterClosed().subscribe((notes: string | undefined) => {
      if (!notes) return;
      this.service.confirmAttendance(session.id, notes).subscribe({
        next: () => (this.sessions$ = this.load()),
      });
    });
  }

  onEditEvolution(session: Session): void {
    const dialog = this.dialog.open(EvolutionFormDialogComponent, {
      width: '700px',
      data: { title: 'Editar evolução', patient: session.paciente, evolution: session.evolucao ?? '' },
    });
    dialog.afterClosed().subscribe((notes: string | undefined) => {
      if (!notes || notes === session.evolucao) return;
      this.service.updateEvolution(session.id, notes).subscribe({
        next: () => (this.sessions$ = this.load()),
      });
    });
  }

  canEditEvolution(session: Session): boolean {
    return session.compareceu && Date.now() <= new Date(session.data).getTime() + 7 * 24 * 60 * 60 * 1000;
  }

  private load(): Observable<Session[]> {
    return combineLatest([
      this.service.list().pipe(catchError(() => of([]))),
      this.search.query$,
    ]).pipe(map(([sessions, query]) => sessions.filter((session) =>
      (!session.compareceu || this.canEditEvolution(session)) &&
      this.search.matches(query, session.paciente, session.psicologo,
        new Date(session.data).toLocaleString('pt-BR'), session.compareceu ? 'concluído' : 'pendente')
    )));
  }
}
