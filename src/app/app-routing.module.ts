import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentComponent } from './pages/appointment/appointment.component';
import { PatientComponent } from './pages/patient/patient.component';
import { PsychologistComponent } from './pages/psychologist/psychologist.component';
import { ReportComponent } from './pages/report/report.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PsychologistFormComponent } from './pages/psychologist-form/psychologist-form.component';
import { AppointmentFormComponent } from './pages/appointment-form/appointment-form.component';
import { ServiceLocationComponent } from './pages/service-location/service-location.component';
import { ServiceLocationFormComponent } from './pages/service-location-form/service-location-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/appointment', pathMatch: 'full' },
  { path: 'appointment', component: AppointmentComponent },
  { path: 'appointment/include', component: AppointmentFormComponent },
  { path: 'appointment/edit/:id', component: AppointmentFormComponent },

  { path: 'patient', component: PatientComponent },
  { path: 'patient/include', component: PatientFormComponent },
  { path: 'patient/edit/:id', component: PatientFormComponent },

  { path: 'psychologist', component: PsychologistComponent },
  { path: 'psychologist/include', component: PsychologistFormComponent },
  { path: 'psychologist/edit/:id', component: PsychologistFormComponent },

  { path: 'service-location', component: ServiceLocationComponent },
  { path: 'service-location/include', component: ServiceLocationFormComponent },
  { path: 'service-location/edit/:id', component: ServiceLocationFormComponent },

  { path: 'history', component: ReportComponent },
  { path: 'report', redirectTo: '/history', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
