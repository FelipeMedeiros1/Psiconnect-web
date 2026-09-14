import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-consultation-menu',
  templateUrl: './consultation-menu.component.html',
  styleUrls: ['./consultation-menu.component.scss'],
})
export class ConsultationMenuComponent {
  pageTitle: string = 'Agenda';

  constructor(private router: Router, private searchService: SearchService) {}

  onSearch(value: string): void {
    this.searchService.setQuery(value);
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.updateTitleBasedOnRoute(currentRoute);
    });
  }

  updateTitle(title: string) {
    this.pageTitle = title;
  }

  private updateTitleBasedOnRoute(route: string) {
    if (route.startsWith('/appointment/include')) this.pageTitle = 'Novo agendamento';
    else if (route.startsWith('/appointment/edit')) this.pageTitle = 'Editar agendamento';
    else if (route.startsWith('/appointment')) this.pageTitle = 'Agenda';
    else if (route.startsWith('/patient/include')) this.pageTitle = 'Novo paciente';
    else if (route.startsWith('/patient/edit')) this.pageTitle = 'Editar paciente';
    else if (route.startsWith('/patient')) this.pageTitle = 'Pacientes';
    else if (route.startsWith('/psychologist/include')) this.pageTitle = 'Novo psicólogo';
    else if (route.startsWith('/psychologist/edit')) this.pageTitle = 'Editar psicólogo';
    else if (route.startsWith('/psychologist')) this.pageTitle = 'Psicólogos';
    else if (route.startsWith('/service-location/include')) this.pageTitle = 'Novo local de atendimento';
    else if (route.startsWith('/service-location/edit')) this.pageTitle = 'Editar local de atendimento';
    else if (route.startsWith('/service-location')) this.pageTitle = 'Locais de atendimento';
    else if (route.startsWith('/history') || route.startsWith('/report')) this.pageTitle = 'Histórico';
    else this.pageTitle = 'Agenda';
  }
}
