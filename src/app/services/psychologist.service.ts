import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Psychologist {
  id: number;
  ativo: boolean;
  nome: string;
  crp: string;
  contato: { email: string; telefone: string };
  especialidade: string;
  endereco: PsychologistRegistration['endereco'];
}

export interface PsychologistRegistration {
  nome: string;
  crp: string;
  especialidade: string;
  contato: { email: string; telefone: string };
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    cep: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PsychologistService {
  private readonly api = '/psicologos';

  constructor(private http: HttpClient) {}

  list(): Observable<Psychologist[]> {
    return this.http.get<{ content: Psychologist[] }>(this.api).pipe(
      map((response) => response.content)
    );
  }

  save(psychologist: PsychologistRegistration): Observable<Psychologist> {
    return this.http.post<Psychologist>(this.api, psychologist);
  }

  findById(id: number): Observable<Psychologist> {
    return this.http.get<Psychologist>(`${this.api}/${id}`);
  }

  update(id: number, psychologist: Partial<PsychologistRegistration>): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}`, { id, ...psychologist });
  }

  deactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}/desativar`, {});
  }
}
