import api from './api';
import { ResumoMensal, ResumoAnual, ComparativoMensal, GastoMensal } from '../types';

export const relatorioService = {
  async getResumoMensal(ano: number, mes: number): Promise<ResumoMensal> {
    const response = await api.get<ResumoMensal>(`/api/relatorios/mensal/${ano}/${mes}`);
    return response.data;
  },

  async getResumoAnual(ano: number): Promise<ResumoAnual> {
    const response = await api.get<ResumoAnual>(`/api/relatorios/anual/${ano}`);
    return response.data;
  },

  async getComparativo(ano: number, mes: number): Promise<ComparativoMensal> {
    const response = await api.get<ComparativoMensal>(`/api/relatorios/comparativo/${ano}/${mes}`);
    return response.data;
  },

  async getEvolucao(ano: number): Promise<GastoMensal[]> {
    const response = await api.get<GastoMensal[]>(`/api/relatorios/evolucao/${ano}`);
    return response.data;
  }
};
