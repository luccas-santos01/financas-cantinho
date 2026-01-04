import api from './api';
import { Categoria, CriarCategoria, AtualizarCategoria } from '../types';

export const categoriaService = {
  async getAll(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>('/api/categorias');
    return response.data;
  },

  async getById(id: number): Promise<Categoria> {
    const response = await api.get<Categoria>(`/api/categorias/${id}`);
    return response.data;
  },

  async create(data: CriarCategoria): Promise<Categoria> {
    const response = await api.post<Categoria>('/api/categorias', data);
    return response.data;
  },

  async update(id: number, data: AtualizarCategoria): Promise<Categoria> {
    const response = await api.put<Categoria>(`/api/categorias/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/categorias/${id}`);
  }
};
