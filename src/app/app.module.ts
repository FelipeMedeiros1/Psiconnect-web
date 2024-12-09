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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
