export interface Patient {
  id?: number;
  status?: boolean;
  localAtendimento?: { id: number; nomeLugar: string } | null;
  email?: string;
  telefone?: string;
  responsavel: {
    nomeResponsavel: string;
    cpfResponsavel: string;
  };
  dataNascimento: Date;
  nome: string;
  cpf: string;
  profissao: string;
  contato: {
    telefone: string;
    email: string;
  };
  endereco: {
    logradouro: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
  };
}
