import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tags, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriaService } from '../services/categoriaService';
import { Categoria, CriarCategoria } from '../types';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280'
];

const ICONS = [
  'utensils', 'car', 'home', 'heart-pulse', 'graduation-cap',
  'gamepad-2', 'shirt', 'file-text', 'shopping-cart', 'coffee',
  'gift', 'plane', 'smartphone', 'tv', 'more-horizontal'
];

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState<CriarCategoria>({
    nome: '',
    cor: COLORS[0],
    icone: ICONS[0],
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome) {
      toast.error('Informe o nome da categoria');
      return;
    }

    try {
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, {
          nome: form.nome,
          cor: form.cor,
          icone: form.icone,
          ativo: editingCategoria.ativo,
        });
        toast.success('Categoria atualizada!');
      } else {
        await categoriaService.create(form);
        toast.success('Categoria criada!');
      }
      closeModal();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoriaService.delete(id);
      toast.success('Categoria desativada!');
      setShowDeleteConfirm(null);
      loadCategorias();
    } catch (error) {
      console.error('Erro ao desativar categoria:', error);
      toast.error('Erro ao desativar categoria');
    }
  };

  const openEditModal = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setForm({
      nome: categoria.nome,
      cor: categoria.cor,
      icone: categoria.icone,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setForm({
      nome: '',
      cor: COLORS[0],
      icone: ICONS[0],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-dark-400">Organize suas despesas por categoria</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Categoria</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : categorias.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className={`bg-dark-900 rounded-xl p-4 border border-dark-800 ${
                !categoria.ativo ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${categoria.cor}20` }}
                >
                  <Tags size={24} style={{ color: categoria.cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{categoria.nome}</p>
                  <p className="text-dark-500 text-sm">
                    {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(categoria)}
                    className="p-2 text-dark-400 hover:text-indigo-400 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  {categoria.ativo && (
                    <button
                      onClick={() => setShowDeleteConfirm(categoria.id)}
                      className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-xl p-12 border border-dark-800 flex flex-col items-center justify-center">
          <Tags size={48} className="text-dark-600 mb-4" />
          <p className="text-dark-400 text-lg">Nenhuma categoria cadastrada</p>
          <p className="text-dark-500 text-sm mt-1">
            Clique em "Nova Categoria" para adicionar
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-dark-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-dark-900 p-4 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
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
                <label className="block text-sm text-dark-400 mb-2">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Alimentação"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, cor: color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        form.cor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icone: icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        form.icone === icon
                          ? 'bg-indigo-600 text-white'
                          : 'bg-dark-800 text-dark-400 hover:text-white'
                      }`}
                    >
                      <Tags size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all"
              >
                {editingCategoria ? 'Salvar Alterações' : 'Criar Categoria'}
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
              Desativar Categoria?
            </h3>
            <p className="text-dark-400 mb-6">
              A categoria será desativada mas as despesas existentes serão mantidas.
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
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
