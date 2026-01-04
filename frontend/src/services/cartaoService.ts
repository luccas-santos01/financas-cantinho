import api from './api';
import { Cartao } from '../types';

export const cartaoService = {
  async getAll(): Promise<Cartao[]> {
    const response = await api.get<Cartao[]>('/api/cartoes');
    return response.data;
  },

  async getById(id: number): Promise<Cartao> {
    const response = await api.get<Cartao>(`/api/cartoes/${id}`);
    return response.data;
  },

  async create(data: { nome: string; limite?: number | null }): Promise<Cartao> {
    const response = await api.post<Cartao>('/api/cartoes', data);
    return response.data;
  },

  async update(id: number, data: { nome: string; limite?: number | null; ativo: boolean }): Promise<Cartao> {
    const response = await api.put<Cartao>(`/api/cartoes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/cartoes/${id}`);
  },
};
