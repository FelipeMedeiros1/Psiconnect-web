import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultation-menu',
  templateUrl: './consultation-menu.component.html',
  styleUrls: ['./consultation-menu.component.scss'],
})
export class ConsultationMenuComponent {
  @ViewChild('sidenav') sidenav?: MatSidenav;

  pageTitle: string = 'Agendamento';
  isMobile = false;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => (this.isMobile = result.matches));
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.updateTitleBasedOnRoute(currentRoute);
    });
  }

  updateTitle(title: string) {
    this.pageTitle = title;
    this.closeMenuOnMobile();
  }

  closeMenuOnMobile() {
    if (this.isMobile) {
      this.sidenav?.close();
    }
  }

  private updateTitleBasedOnRoute(route: string) {
    if (route.startsWith('/patient/edit/')) {
      this.pageTitle = 'Paciente - Editar';
      return;
    }

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
