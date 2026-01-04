import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartaoService } from '../services/cartaoService';
import { Cartao } from '../types';

export default function Cartoes() {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cartao | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({ nome: '', limite: undefined as number | undefined });

  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    setLoading(true);
    try {
      const data = await cartaoService.getAll();
      setCartoes(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      toast.error('Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) {
      toast.error('Informe o nome do cartão');
      return;
    }

    try {
      if (editing) {
        await cartaoService.update(editing.id, { nome: form.nome, limite: form.limite, ativo: editing.ativo });
        toast.success('Cartão atualizado!');
      } else {
        await cartaoService.create({ nome: form.nome, limite: form.limite });
        toast.success('Cartão criado!');
      }
      closeModal();
      loadCartoes();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      toast.error('Erro ao salvar cartão');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await cartaoService.delete(id);
      toast.success('Cartão desativado!');
      setShowDeleteConfirm(null);
      loadCartoes();
    } catch (error) {
      console.error('Erro ao desativar cartão:', error);
      toast.error('Erro ao desativar cartão');
    }
  };

  const openEditModal = (c: Cartao) => {
    setEditing(c);
    setForm({ nome: c.nome, limite: c.limite ?? undefined });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ nome: '', limite: undefined });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartões</h1>
          <p className="text-dark-400">Gerencie seus cartões</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all">
          <Plus size={20} />
          <span>Novo Cartão</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : cartoes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.map((c) => (
            <div key={c.id} className={`bg-dark-900 rounded-xl p-4 border border-dark-800 ${!c.ativo ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-dark-800">
                  <CreditCard size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{c.nome}</p>
                  <p className="text-dark-500 text-sm">{c.ativo ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(c)} className="p-2 text-dark-400 hover:text-indigo-400 transition-colors"><Edit2 size={18} /></button>
                  {c.ativo && (<button onClick={() => setShowDeleteConfirm(c.id)} className="p-2 text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-xl p-12 border border-dark-800 flex flex-col items-center justify-center">
          <CreditCard size={48} className="text-dark-600 mb-4" />
          <p className="text-dark-400 text-lg">Nenhum cartão cadastrado</p>
          <p className="text-dark-500 text-sm mt-1">Clique em "Novo Cartão" para adicionar</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-dark-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-dark-900 p-4 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editing ? 'Editar Cartão' : 'Novo Cartão'}</h2>
              <button onClick={closeModal} className="p-2 text-dark-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Nome *</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Limite</label>
                <input type="number" step="0.01" value={form.limite ?? ''} onChange={(e) => setForm({ ...form, limite: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all">{editing ? 'Salvar Alterações' : 'Criar Cartão'}</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-2">Desativar Cartão?</h3>
            <p className="text-dark-400 mb-6">O cartão será desativado mas as despesas existentes serão mantidas.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl transition-all">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all">Desativar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
