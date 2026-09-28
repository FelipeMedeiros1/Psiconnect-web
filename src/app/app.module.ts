import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContainerComponent } from './shared/container/container.component';
import { HttpClientModule } from '@angular/common/http';
import { ModalComponent } from './shared/modal/modal.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { PatientComponent } from './pages/patient/patient.component';
import { PsychologistComponent } from './pages/psychologist/psychologist.component';
import { ReportComponent } from './pages/report/report.component';
import { AppMaterialModule } from './shared/app-material/app-material.module';
import { ErrorDialogComponent } from './shared/error-dialog/error-dialog.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConsultationMenuComponent } from './consultation-menu/consultation-menu.component';
import { PsychologistFormComponent } from './pages/psychologist-form/psychologist-form.component';
import { AppointmentFormComponent } from './pages/appointment-form/appointment-form.component';
import { AppointmentConfirmationDialogComponent } from './shared/appointment-confirmation-dialog/appointment-confirmation-dialog.component';
import { TimePickerDialogComponent } from './shared/time-picker-dialog/time-picker-dialog.component';
import { EvolutionFormDialogComponent } from './shared/evolution-form-dialog/evolution-form-dialog.component';
import { ServiceLocationComponent } from './pages/service-location/service-location.component';
import { ServiceLocationFormComponent } from './pages/service-location-form/service-location-form.component';
import { DischargeDialogComponent } from './shared/discharge-dialog/discharge-dialog.component';
import { PatientDetailsDialogComponent } from './shared/patient-details-dialog/patient-details-dialog.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

export function portugueseDatepickerIntl(): MatDatepickerIntl {
  const intl = new MatDatepickerIntl();
  intl.calendarLabel = 'Calendário';
  intl.openCalendarLabel = 'Abrir calendário';
  intl.closeCalendarLabel = 'Fechar calendário';
  intl.prevMonthLabel = 'Mês anterior';
  intl.nextMonthLabel = 'Próximo mês';
  intl.prevYearLabel = 'Ano anterior';
  intl.nextYearLabel = 'Próximo ano';
  intl.prevMultiYearLabel = 'Anos anteriores';
  intl.nextMultiYearLabel = 'Próximos anos';
  intl.switchToMonthViewLabel = 'Selecionar mês';
  intl.switchToMultiYearViewLabel = 'Selecionar ano';
  intl.startDateLabel = 'Data inicial';
  intl.endDateLabel = 'Data final';
  return intl;
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,

    ContainerComponent,
    ModalComponent,
    AppointmentComponent,
    PatientComponent,
    PsychologistComponent,
    ReportComponent,
    ErrorDialogComponent,
    PatientFormComponent,
    ConsultationMenuComponent,
    PsychologistFormComponent,
    AppointmentFormComponent,
    AppointmentConfirmationDialogComponent,
    TimePickerDialogComponent,
    EvolutionFormDialogComponent,
    ServiceLocationComponent,
    ServiceLocationFormComponent,
    DischargeDialogComponent,
    PatientDetailsDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MatDatepickerIntl, useFactory: portugueseDatepickerIntl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
