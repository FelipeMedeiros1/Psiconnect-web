import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Psychologist } from '../model/psychologist';

@Injectable({ providedIn: 'root' })
export class PsychologistService {
  private readonly API = environment.apiUrl
    ? `${environment.apiUrl}/psicologos`
    : '/psicologos';

  constructor(private http: HttpClient) {}

  list(): Observable<Psychologist[]> {
    return this.http
      .get<{ content: Psychologist[] }>(this.API)
      .pipe(first(), map((response) => response.content));
  }

  save(psychologist: Psychologist): Observable<Psychologist> {
    return this.http.post<Psychologist>(this.API, psychologist).pipe(first());
  }
}
