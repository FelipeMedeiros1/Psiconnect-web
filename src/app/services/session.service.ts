import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Session {
  id: number;
  data: string;
  psicologo: string;
  paciente: string;
  idPsicologo?: number;
  idPaciente?: number;
  valorSessao?: number;
  compareceu: boolean;
  evolucao?: string;
}

export interface AttendanceHistory {
  id: number;
  data: string;
  psicologo: string;
  psicologoId: number;
  paciente: string;
  pacienteId: number;
  valorSessao: number;
  historico: string;
}

export interface SessionRegistration {
  idPsicologo: number | null;
  idPaciente: number;
  data: string;
  especialidade: string | null;
  valorSessao: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = '/sessoes';

  constructor(private http: HttpClient) {}

  list(): Observable<Session[]> {
    return this.http.get<{ content: Session[] }>(this.api).pipe(
      map((response) => response.content.sort((first, second) => {
        if (first.compareceu !== second.compareceu) {
          return first.compareceu ? 1 : -1;
        }
        if (first.compareceu && second.compareceu) {
          return new Date(second.data).getTime() - new Date(first.data).getTime();
        }
        return new Date(first.data).getTime() - new Date(second.data).getTime();
      }))
    );
  }

  schedule(session: SessionRegistration): Observable<Session> {
    return this.http.post<Session>(this.api, session);
  }

  findById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.api}/${id}`);
  }

  update(id: number, session: SessionRegistration): Observable<Session> {
    return this.http.put<Session>(`${this.api}/${id}`, { id, ...session });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  confirmAttendance(id: number, informacoes: string): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}/atendimento`, { informacoes });
  }

  updateEvolution(id: number, informacoes: string): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}/evolucao`, { informacoes });
  }

  history(): Observable<AttendanceHistory[]> {
    return this.http.get<{ content: AttendanceHistory[] }>(`${this.api}/historico`).pipe(
      map((response) => response.content.sort(
        (first, second) => new Date(second.data).getTime() - new Date(first.data).getTime()
      ))
    );
  }
}
