export interface ServiceLocation {
  id: number;
  nomeLugar: string;
  ativo: boolean;
  endereco: {
    logradouro: string; bairro: string; cep: string; numero: string;
    complemento: string; cidade: string; uf: string;
  } | null;
}
