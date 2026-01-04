import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Receipt, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { relatorioService } from '../services/relatorioService';
import { despesaService } from '../services/despesaService';
import { ResumoMensal, ComparativoMensal, Despesa } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [comparativo, setComparativo] = useState<ComparativoMensal | null>(null);
  const [ultimasDespesas, setUltimasDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumoData, comparativoData, despesasData] = await Promise.all([
          relatorioService.getResumoMensal(ano, mes),
          relatorioService.getComparativo(ano, mes),
          despesaService.getAll({ pagina: 1, itensPorPagina: 5 }),
        ]);
        setResumo(resumoData);
        setComparativo(comparativoData);
        setUltimasDespesas(despesasData.items);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ano, mes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400">
            {format(hoje, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link
          to="/despesas"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Despesa</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total do Mês */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <p className="text-dark-400 text-sm">Total do Mês</p>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCurrency(resumo?.total ?? 0)}
          </p>
          <p className="text-dark-500 text-sm mt-2">
            {resumo?.quantidadeDespesas ?? 0} despesas
          </p>
        </div>

        {/* Comparativo */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <p className="text-dark-400 text-sm">vs. Mês Anterior</p>
          <div className="flex items-center gap-2 mt-2">
            {comparativo && comparativo.percentualVariacao >= 0 ? (
              <TrendingUp className="text-red-500" size={24} />
            ) : (
              <TrendingDown className="text-green-500" size={24} />
            )}
            <span
              className={`text-2xl font-bold ${
                comparativo && comparativo.percentualVariacao >= 0
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {comparativo ? Math.abs(comparativo.percentualVariacao).toFixed(1) : 0}%
            </span>
          </div>
          <p className="text-dark-500 text-sm mt-2">
            {formatCurrency(comparativo?.diferenca ?? 0)}
          </p>
        </div>

        {/* Média por Despesa */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 sm:col-span-2 lg:col-span-1">
          <p className="text-dark-400 text-sm">Média por Despesa</p>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCurrency(
              resumo && resumo.quantidadeDespesas > 0
                ? resumo.total / resumo.quantidadeDespesas
                : 0
            )}
          </p>
          <p className="text-dark-500 text-sm mt-2">este mês</p>
        </div>
      </div>

      {/* Chart and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="text-lg font-semibold text-white mb-4">Por Categoria</h2>
          {resumo && resumo.porCategoria.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resumo.porCategoria}
                    dataKey="total"
                    nameKey="categoriaNome"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {resumo.porCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.categoriaCor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-dark-500">
              Nenhuma despesa este mês
            </div>
          )}
          
          {/* Legend */}
          {resumo && resumo.porCategoria.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {resumo.porCategoria.slice(0, 6).map((cat) => (
                <div key={cat.categoriaId} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.categoriaCor }}
                  />
                  <span className="text-dark-400 text-sm truncate">
                    {cat.categoriaNome}
                  </span>
                  <span className="text-dark-500 text-xs ml-auto">
                    {cat.percentual.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Últimas Despesas</h2>
            <Link
              to="/despesas"
              className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
            >
              Ver todas
              <ArrowRight size={16} />
            </Link>
          </div>

          {ultimasDespesas.length > 0 ? (
            <div className="space-y-3">
              {ultimasDespesas.map((despesa) => (
                <div
                  key={despesa.id}
                  className="flex items-center gap-4 p-3 bg-dark-800 rounded-xl"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${despesa.categoriaCor}20` }}
                  >
                    <Receipt size={20} style={{ color: despesa.categoriaCor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {despesa.descricao}
                    </p>
                    <p className="text-dark-500 text-sm">
                      {format(new Date(despesa.data), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <p className="text-white font-medium">
                    {formatCurrency(despesa.valor)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-dark-500">
              <Receipt size={48} className="mb-2 opacity-50" />
              <p>Nenhuma despesa registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
