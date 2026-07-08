import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

export interface Municipality {
  id: number;
  name: string;
  state: string;
}

export interface ZipCodeAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

interface IbgeMunicipality {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: { sigla?: string };
    };
  };
  'regiao-imediata'?: {
    'regiao-intermediaria'?: {
      UF?: { sigla?: string };
    };
  };
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly municipalitiesUrl =
    'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';

  private municipalities$?: Observable<Municipality[]>;

  constructor(private http: HttpClient) {}

  getMunicipalities(): Observable<Municipality[]> {
    if (!this.municipalities$) {
      this.municipalities$ = this.http
        .get<IbgeMunicipality[]>(this.municipalitiesUrl)
        .pipe(
          map((municipalities) =>
            municipalities.map((municipality) => ({
              id: municipality.id,
              name: municipality.nome,
              state:
                municipality.microrregiao?.mesorregiao?.UF?.sigla ||
                municipality['regiao-imediata']?.['regiao-intermediaria']?.UF
                  ?.sigla ||
                '',
            }))
          ),
          shareReplay(1)
        );
    }

    return this.municipalities$;
  }

  getAddressByZipCode(zipCode: string): Observable<ZipCodeAddress> {
    const normalizedZipCode = zipCode.replace(/\D/g, '');
    return this.http.get<ZipCodeAddress>(
      `https://viacep.com.br/ws/${normalizedZipCode}/json/`
    );
  }
}
