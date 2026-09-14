import { Component } from '@angular/core';
import { catchError, combineLatest, map, Observable, of } from 'rxjs';
import { Psychologist, PsychologistService } from 'src/app/services/psychologist.service';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-psychologist',
  templateUrl: './psychologist.component.html',
  styleUrls: ['./psychologist.component.scss']
})
export class PsychologistComponent {
  readonly displayedColumns = ['id', 'ativo', 'nome', 'crp', 'especialidade', 'email', 'actions'];
  psychologists$: Observable<Psychologist[]>;

  constructor(private service: PsychologistService, private router: Router, private search: SearchService) {
    this.psychologists$ = this.load();
  }

  onAdd(): void {
    this.router.navigate(['psychologist/include']);
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

  private load(): Observable<Psychologist[]> {
    return combineLatest([
      this.service.list().pipe(catchError(() => of([]))),
      this.search.query$,
    ]).pipe(map(([psychologists, query]) => psychologists.filter((psychologist) =>
      this.search.matches(query, psychologist.id, psychologist.nome, psychologist.crp,
        psychologist.especialidade, psychologist.contato?.email,
        psychologist.ativo ? 'ativo' : 'inativo')
    )));
  }
}
