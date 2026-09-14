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
      map((response: { content: Patient[] }) => response.content.sort(
        (first, second) => (second.id ?? 0) - (first.id ?? 0)
      ))
    );
  }

  save(record: Partial<Patient>): Observable<Patient> {
    console.log(record);
    return this.httpClient.post<Patient>(this.API, record).pipe(first());
  }

  findById(id: number): Observable<Patient> {
    return this.httpClient.get<Patient>(`${this.API}/${id}`).pipe(first());
  }

  update(id: number, record: object): Observable<Patient> {
    return this.httpClient.put<Patient>(`${this.API}/${id}`, { id, ...record }).pipe(first());
  }

  deactivate(id: number, motivoAlta: string): Observable<void> {
    return this.httpClient.put<void>(`${this.API}/alta`, { id, motivoAlta }).pipe(first());
  }

  associateLocation(id: number, localAtendimentoId: number | null): Observable<Patient> {
    return this.httpClient.put<Patient>(`${this.API}/${id}/local-atendimento`, { localAtendimentoId }).pipe(first());
  }
}
