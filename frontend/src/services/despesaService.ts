import api from './api';
import { Despesa, DespesasPaginadas, CriarDespesa } from '../types';

export interface DespesaFiltro {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: number;
  cartaoId?: number;
  busca?: string;
  pagina?: number;
  itensPorPagina?: number;
}

export const despesaService = {
  async getAll(filtro: DespesaFiltro = {}): Promise<DespesasPaginadas> {
    const params = new URLSearchParams();
    
    if (filtro.dataInicio) params.append('dataInicio', filtro.dataInicio);
    if (filtro.dataFim) params.append('dataFim', filtro.dataFim);
    if (filtro.categoriaId) params.append('categoriaId', filtro.categoriaId.toString());
    if (filtro.cartaoId) params.append('cartaoId', filtro.cartaoId.toString());
    if (filtro.busca) params.append('busca', filtro.busca);
    if (filtro.pagina) params.append('pagina', filtro.pagina.toString());
    if (filtro.itensPorPagina) params.append('itensPorPagina', filtro.itensPorPagina.toString());

    const response = await api.get<DespesasPaginadas>(`/api/despesas?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Despesa> {
    const response = await api.get<Despesa>(`/api/despesas/${id}`);
    return response.data;
  },

  async create(data: CriarDespesa): Promise<Despesa> {
    const response = await api.post<Despesa>('/api/despesas', data);
    return response.data;
  },

  async update(id: number, data: CriarDespesa): Promise<Despesa> {
    const response = await api.put<Despesa>(`/api/despesas/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/despesas/${id}`);
  },

  async uploadComprovante(id: number, file: File): Promise<Despesa> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<Despesa>(`/api/despesas/${id}/comprovante`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeComprovante(id: number): Promise<void> {
    await api.delete(`/api/despesas/${id}/comprovante`);
  }
};
