// Types for the application

export interface Categoria {
  id: number;
  nome: string;
  cor: string;
  icone: string;
  ativo: boolean;
}

export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  observacao?: string;
  comprovanteUrl?: string;
  comprovanteNome?: string;
  categoriaId: number;
  categoriaNome: string;
  categoriaCor: string;
  cartaoId?: number | null;
  cartaoNome?: string | null;
  criadoEm: string;
}

export interface DespesasPaginadas {
  items: Despesa[];
  totalItems: number;
  paginaAtual: number;
  totalPaginas: number;
}

export interface CriarDespesa {
  descricao: string;
  valor: number;
  data: string;
  observacao?: string;
  categoriaId: number;
  cartaoId?: number | null;
}

export interface Cartao {
  id: number;
  nome: string;
  limite?: number | null;
  ativo: boolean;
}

export interface CriarCategoria {
  nome: string;
  cor?: string;
  icone?: string;
}

export interface AtualizarCategoria {
  nome: string;
  cor?: string;
  icone?: string;
  ativo: boolean;
}

export interface ResumoMensal {
  ano: number;
  mes: number;
  total: number;
  quantidadeDespesas: number;
  porCategoria: GastoPorCategoria[];
}

export interface ResumoAnual {
  ano: number;
  total: number;
  quantidadeDespesas: number;
  porMes: GastoMensal[];
  porCategoria: GastoPorCategoria[];
}

export interface GastoPorCategoria {
  categoriaId: number;
  categoriaNome: string;
  categoriaCor: string;
  total: number;
  quantidade: number;
  percentual: number;
}

export interface GastoMensal {
  mes: number;
  mesNome: string;
  total: number;
  quantidade: number;
}

export interface ComparativoMensal {
  anoAtual: number;
  mesAtual: number;
  totalAtual: number;
  anoAnterior: number;
  mesAnterior: number;
  totalAnterior: number;
  diferenca: number;
  percentualVariacao: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}
