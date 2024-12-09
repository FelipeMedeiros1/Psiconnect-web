import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../model/patient';
import { delay, first, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  //private readonly API = '/assets/patient.json';
  private readonly API = '/pacientes';

  constructor(private httpClient: HttpClient) {}

  list(): Observable<Patient[]> {
    return this.httpClient.get<{ content: Patient[] }>(this.API).pipe(
      first(),
      delay(500),
      tap((response) => console.log(response)),
      map((response: { content: any }) => response.content)
    );
  }

  save(record: Partial<Patient>): Observable<Patient> {
    console.log(record);
    return this.httpClient.post<Patient>(this.API, record).pipe(first());
  }
}
