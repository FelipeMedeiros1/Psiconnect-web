import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentComponent } from './pages/appointment/appointment.component';
import { PatientComponent } from './pages/patient/patient.component';
import { PsychologistComponent } from './pages/psychologist/psychologist.component';
import { ReportComponent } from './pages/report/report.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PsychologistFormComponent } from './pages/psychologist-form/psychologist-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/appointment', pathMatch: 'full' },
  { path: 'appointment', component: AppointmentComponent },

  { path: 'patient', component: PatientComponent },
  { path: 'patient/include', component: PatientFormComponent },
  { path: 'patient/edit/:id', component: PatientFormComponent },

  { path: 'psychologist', component: PsychologistComponent },
  { path: 'psychologist/include', component: PsychologistFormComponent },

  { path: 'report', component: ReportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
