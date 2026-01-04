import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, Receipt, Upload, X, Image } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { despesaService, DespesaFiltro } from '../services/despesaService';
import { categoriaService } from '../services/categoriaService';
import { Despesa, DespesasPaginadas, Categoria, CriarDespesa, Cartao } from '../types';
import { cartaoService } from '../services/cartaoService';

export default function Despesas() {
  const [despesas, setDespesas] = useState<DespesasPaginadas | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showComprovante, setShowComprovante] = useState<Despesa | null>(null);

  const [filtro, setFiltro] = useState<DespesaFiltro>({
    pagina: 1,
    itensPorPagina: 20,
  });

  const [form, setForm] = useState<CriarDespesa>({
    descricao: '',
    valor: 0,
    data: format(new Date(), 'yyyy-MM-dd'),
    observacao: '',
    categoriaId: 0,
    cartaoId: undefined,
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    loadDespesas();
    loadCartoes();
  }, [filtro]);

  const loadCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data.filter((c) => c.ativo));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };
    const loadCartoes = async () => {
      try {
        const data = await cartaoService.getAll();
        setCartoes(data.filter((c) => c.ativo));
      } catch (error) {
        console.error('Erro ao carregar cartões:', error);
      }
    };

  const loadDespesas = async () => {
    setLoading(true);
    try {
      const data = await despesaService.getAll(filtro);
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.descricao || !form.valor || !form.categoriaId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingDespesa) {
        await despesaService.update(editingDespesa.id, form);
        toast.success('Despesa atualizada!');
      } else {
        await despesaService.create(form);
        toast.success('Despesa criada!');
      }
      closeModal();
      loadDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await despesaService.delete(id);
      toast.success('Despesa excluída!');
      setShowDeleteConfirm(null);
      loadDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  const handleUploadComprovante = async (id: number, file: File) => {
    try {
      await despesaService.uploadComprovante(id, file);
      toast.success('Comprovante anexado!');
      loadDespesas();
    } catch (error) {
      console.error('Erro ao anexar comprovante:', error);
      toast.error('Erro ao anexar comprovante');
    }
  };

  const openEditModal = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setForm({
      descricao: despesa.descricao,
      valor: despesa.valor,
      data: format(new Date(despesa.data), 'yyyy-MM-dd'),
      observacao: despesa.observacao || '',
      categoriaId: despesa.categoriaId,
      cartaoId: despesa.cartaoId ?? undefined,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDespesa(null);
    setForm({
      descricao: '',
      valor: 0,
      data: format(new Date(), 'yyyy-MM-dd'),
      observacao: '',
      categoriaId: categorias[0]?.id || 0,
      cartaoId: undefined,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Despesas</h1>
          <p className="text-dark-400">Gerencie suas despesas</p>
        </div>
        <button
          onClick={() => {
            setForm({
              ...form,
              categoriaId: categorias[0]?.id || 0,
            });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
        >
          <Plus size={20} />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
          <input
            type="text"
            placeholder="Buscar despesas..."
            value={filtro.busca || ''}
            onChange={(e) => setFiltro({ ...filtro, busca: e.target.value, pagina: 1 })}
            className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
            showFilters
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-dark-900 border-dark-800 text-dark-400 hover:text-white'
          }`}
        >
          <Filter size={20} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-dark-900 rounded-xl p-4 border border-dark-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-dark-400 mb-2">Data Início</label>
            <input
              type="date"
              value={filtro.dataInicio || ''}
              onChange={(e) => setFiltro({ ...filtro, dataInicio: e.target.value, pagina: 1 })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Data Fim</label>
            <input
              type="date"
              value={filtro.dataFim || ''}
              onChange={(e) => setFiltro({ ...filtro, dataFim: e.target.value, pagina: 1 })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Categoria</label>
            <select
              value={filtro.categoriaId || ''}
              onChange={(e) =>
                setFiltro({
                  ...filtro,
                  categoriaId: e.target.value ? Number(e.target.value) : undefined,
                  pagina: 1,
                })
              }
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Despesas List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : despesas && despesas.items.length > 0 ? (
        <>
          <div className="space-y-3">
            {despesas.items.map((despesa) => (
              <div
                key={despesa.id}
                className="bg-dark-900 rounded-xl p-4 border border-dark-800 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${despesa.categoriaCor}20` }}
                >
                  <Receipt size={24} style={{ color: despesa.categoriaCor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{despesa.descricao}</p>
                  <div className="flex items-center gap-2 text-dark-500 text-sm">
                    <span>{format(new Date(despesa.data), 'dd/MM/yyyy')}</span>
                    <span>•</span>
                    <span className="truncate">{despesa.categoriaNome}{despesa.cartaoNome ? ` • ${despesa.cartaoNome}` : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {despesa.comprovanteUrl && (
                    <button
                      onClick={() => setShowComprovante(despesa)}
                      className="p-2 text-dark-400 hover:text-indigo-400 transition-colors"
                      title="Ver comprovante"
                    >
                      <Image size={20} />
                    </button>
                  )}
                  <label className="p-2 text-dark-400 hover:text-indigo-400 transition-colors cursor-pointer">
                    <Upload size={20} />
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadComprovante(despesa.id, file);
                      }}
                    />
                  </label>
                  
                  <button
                    onClick={() => openEditModal(despesa)}
                    className="p-2 text-dark-400 hover:text-indigo-400 transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(despesa.id)}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-white font-semibold whitespace-nowrap">
                  {formatCurrency(despesa.valor)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {despesas.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: despesas.totalPaginas }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setFiltro({ ...filtro, pagina: page })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    page === despesas.paginaAtual
                      ? 'bg-indigo-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-dark-900 rounded-xl p-12 border border-dark-800 flex flex-col items-center justify-center">
          <Receipt size={48} className="text-dark-600 mb-4" />
          <p className="text-dark-400 text-lg">Nenhuma despesa encontrada</p>
          <p className="text-dark-500 text-sm mt-1">
            Clique em "Nova Despesa" para adicionar
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-dark-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-dark-900 p-4 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-dark-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Supermercado"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor || ''}
                  onChange={(e) =>
                    setForm({ ...form, valor: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">Data *</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">
                  Categoria *
                </label>
                <select
                  value={form.categoriaId}
                  onChange={(e) =>
                    setForm({ ...form, categoriaId: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

                <div>
                  <label className="block text-sm text-dark-400 mb-2">Cartão (opcional)</label>
                  <select
                    value={form.cartaoId ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, cartaoId: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Nenhum</option>
                    {cartoes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">
                  Observação
                </label>
                <textarea
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Observações opcionais..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all"
              >
                {editingDespesa ? 'Salvar Alterações' : 'Criar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-2">
              Excluir Despesa?
            </h3>
            <p className="text-dark-400 mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprovante Modal */}
      {showComprovante && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowComprovante(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              onClick={() => setShowComprovante(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-dark-300"
            >
              <X size={24} />
            </button>
            {showComprovante.comprovanteUrl?.endsWith('.pdf') ? (
              <iframe
                src={showComprovante.comprovanteUrl}
                className="w-full h-[80vh] rounded-lg"
                title="Comprovante"
              />
            ) : (
              <img
                src={showComprovante.comprovanteUrl || ''}
                alt="Comprovante"
                className="max-w-full max-h-[80vh] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
