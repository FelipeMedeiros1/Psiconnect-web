import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { Psychologist } from 'src/app/model/psychologist';
import { PsychologistService } from 'src/app/services/psychologist.service';

@Component({
  selector: 'app-psychologist',
  templateUrl: './psychologist.component.html',
  styleUrls: ['./psychologist.component.scss']
})
export class PsychologistComponent {
  psychologists$: Observable<Psychologist[]>;
  displayedColumns = ['crp', 'nome', 'especialidade'];
  expandedPsychologist: Psychologist | null = null;

  constructor(
    private psychologistService: PsychologistService,
    private router: Router
  ) {
    this.psychologists$ = this.psychologistService
      .list()
      .pipe(catchError(() => of([])));
  }

  onAdd(): void {
    this.router.navigate(['/psychologist/include']);
  }

  toggleDetails(psychologist: Psychologist): void {
    this.expandedPsychologist =
      this.expandedPsychologist === psychologist ? null : psychologist;
  }

  getSpecialtyLabel(specialty: string): string {
    const labels: Record<string, string> = {
      INFANTIL: 'Infantil',
      ADOLECENTE: 'Adolescente',
      ADULTO: 'Adulto',
      CASAL: 'Casal',
      FAMILIAR: 'Familiar',
    };
    return labels[specialty] || specialty;
  }
}
