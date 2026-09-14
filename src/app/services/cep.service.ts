import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly api = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscar(cep: string): Observable<EnderecoViaCep> {
    return this.http.get<EnderecoViaCep>(`${this.api}/${cep}/json/`);
  }
}
