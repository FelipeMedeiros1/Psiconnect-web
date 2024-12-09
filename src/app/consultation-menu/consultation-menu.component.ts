import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultation-menu',
  templateUrl: './consultation-menu.component.html',
  styleUrls: ['./consultation-menu.component.scss'],
})
export class ConsultationMenuComponent {
  pageTitle: string = 'Agendamento';

  constructor(private router: Router) {}

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
    switch (route) {
      case '/appointment':
        this.pageTitle = 'Agendamento';
        break;
      case '/patient':
        this.pageTitle = 'Paciente';
        break;
      case '/patient/include':
        this.pageTitle = 'Paciente - Novo';
        break;

      case '/psychologist':
        this.pageTitle = 'Psicólogo';
        break;
      case '/psychologist/include':
        this.pageTitle = 'Psicólogo - Novo';
        break;

      case '/report':
        this.pageTitle = 'Relatório';
        break;
      default:
        this.pageTitle = 'Agendamento';
        break;
    }
  }
}
