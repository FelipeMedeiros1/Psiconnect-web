import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ServiceLocation } from '../model/service-location';

@Injectable({ providedIn: 'root' })
export class ServiceLocationService {
  private readonly api = '/locais-atendimento';
  constructor(private http: HttpClient) {}
  list(): Observable<ServiceLocation[]> { return this.http.get<{content: ServiceLocation[]}>(this.api).pipe(map(r => r.content)); }
  find(id: number): Observable<ServiceLocation> { return this.http.get<ServiceLocation>(`${this.api}/${id}`); }
  save(data: Partial<ServiceLocation>): Observable<ServiceLocation> { return this.http.post<ServiceLocation>(this.api, data); }
  update(id: number, data: Partial<ServiceLocation>): Observable<ServiceLocation> { return this.http.put<ServiceLocation>(`${this.api}/${id}`, data); }
  deactivate(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
