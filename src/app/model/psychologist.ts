export type PsychologistSpecialty =
  | 'INFANTIL'
  | 'ADOLECENTE'
  | 'ADULTO'
  | 'CASAL'
  | 'FAMILIAR';

export interface Psychologist {
  id?: number;
  ativo?: boolean;
  nome: string;
  crp: string;
  email?: string;
  telefone?: string;
  especialidade: PsychologistSpecialty;
  contato?: {
    telefone: string;
    email: string;
  };
  endereco?: {
    logradouro: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    complemento: string;
    numero: string;
  };
}
