import { Component } from '@angular/core';
import { catchError, combineLatest, map, Observable, of, startWith } from 'rxjs';
import { Psychologist, PsychologistService } from 'src/app/services/psychologist.service';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { PsychologistDetailsDialogComponent } from 'src/app/shared/psychologist-details-dialog/psychologist-details-dialog.component';

@Component({
  selector: 'app-psychologist',
  templateUrl: './psychologist.component.html',
  styleUrls: ['./psychologist.component.scss']
})
export class PsychologistComponent {
  readonly displayedColumns = ['crp', 'nome', 'actions'];
  readonly statusControl = new FormControl<'ativos' | 'inativos' | 'todos'>('ativos', { nonNullable: true });
  psychologists$: Observable<Psychologist[]>;

  constructor(private service: PsychologistService, private router: Router, private search: SearchService, private dialog: MatDialog) {
    this.psychologists$ = this.load();
  }

  onAdd(): void {
    this.router.navigate(['psychologist/include']);
  }


  onView(psychologist: Psychologist): void {
    this.service.findById(psychologist.id).subscribe({
      next: (details) => this.dialog.open(PsychologistDetailsDialogComponent, {
        width: '460px',
        maxWidth: 'calc(100vw - 24px)',
        data: details,
      }),
      error: () => this.dialog.open(PsychologistDetailsDialogComponent, {
        width: '460px',
        maxWidth: 'calc(100vw - 24px)',
        data: psychologist,
      }),
    });
  }
  onEdit(psychologist: Psychologist): void {
    this.router.navigate(['psychologist/edit', psychologist.id]);
  }

  onDeactivate(psychologist: Psychologist): void {
    if (!psychologist.ativo || !window.confirm(`Inativar o psicólogo ${psychologist.nome}?`)) return;
    this.service.deactivate(psychologist.id).subscribe({
      next: () => (this.psychologists$ = this.load()),
    });
  }

  onReactivate(psychologist: Psychologist): void {
    if (psychologist.ativo || !window.confirm(`Reativar o psicólogo ${psychologist.nome}?`)) return;
    this.service.reactivate(psychologist.id).subscribe({
      next: () => (this.psychologists$ = this.load()),
    });
  }

  private load(): Observable<Psychologist[]> {
    return combineLatest([
      this.service.list().pipe(catchError(() => of([]))),
      this.search.query$,
      this.statusControl.valueChanges.pipe(startWith('ativos' as const)),
    ]).pipe(map(([psychologists, query, status]) => psychologists.filter((psychologist) =>
      (status === 'todos' || (status === 'ativos' ? psychologist.ativo === true : psychologist.ativo === false)) &&
      this.search.matches(query, psychologist.id, psychologist.nome, psychologist.crp,
        psychologist.especialidade, psychologist.contato?.email,
        psychologist.ativo ? 'ativo' : 'inativo')
    )));
  }
}
