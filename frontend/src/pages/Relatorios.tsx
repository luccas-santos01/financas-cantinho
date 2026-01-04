import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { relatorioService } from '../services/relatorioService';
import { ResumoMensal, ResumoAnual, ComparativoMensal } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

type ViewType = 'mensal' | 'anual';

export default function Relatorios() {
  const [viewType, setViewType] = useState<ViewType>('mensal');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [resumoMensal, setResumoMensal] = useState<ResumoMensal | null>(null);
  const [resumoAnual, setResumoAnual] = useState<ResumoAnual | null>(null);
  const [comparativo, setComparativo] = useState<ComparativoMensal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [viewType, ano, mes]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewType === 'mensal') {
        const [resumo, comp] = await Promise.all([
          relatorioService.getResumoMensal(ano, mes),
          relatorioService.getComparativo(ano, mes),
        ]);
        setResumoMensal(resumo);
        setComparativo(comp);
      } else {
        const resumo = await relatorioService.getResumoAnual(ano);
        setResumoAnual(resumo);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return formatCurrency(value);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewType === 'mensal') {
      if (direction === 'prev') {
        if (mes === 1) {
          setMes(12);
          setAno(ano - 1);
        } else {
          setMes(mes - 1);
        }
      } else {
        if (mes === 12) {
          setMes(1);
          setAno(ano + 1);
        } else {
          setMes(mes + 1);
        }
      }
    } else {
      setAno(direction === 'prev' ? ano - 1 : ano + 1);
    }
  };

  const getMesNome = (m: number) => {
    return format(new Date(2024, m - 1, 1), 'MMMM', { locale: ptBR });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-dark-400">Analise seus gastos</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-dark-900 rounded-xl p-1 border border-dark-800">
          <button
            onClick={() => setViewType('mensal')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewType === 'mensal'
                ? 'bg-indigo-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setViewType('anual')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewType === 'anual'
                ? 'bg-indigo-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigatePeriod('prev')}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xl font-semibold text-white min-w-[200px] text-center">
          {viewType === 'mensal'
            ? `${getMesNome(mes)} de ${ano}`
            : ano.toString()}
        </span>
        <button
          onClick={() => navigatePeriod('next')}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : viewType === 'mensal' ? (
        /* Monthly View */
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <p className="text-dark-400 text-sm">Total do Mês</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(resumoMensal?.total ?? 0)}
              </p>
              <p className="text-dark-500 text-sm mt-2">
                {resumoMensal?.quantidadeDespesas ?? 0} despesas
              </p>
            </div>

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
                  {comparativo
                    ? Math.abs(comparativo.percentualVariacao).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <p className="text-dark-500 text-sm mt-2">
                {formatCurrency(comparativo?.diferenca ?? 0)}
              </p>
            </div>

            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <p className="text-dark-400 text-sm">Média por Despesa</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(
                  resumoMensal && resumoMensal.quantidadeDespesas > 0
                    ? resumoMensal.total / resumoMensal.quantidadeDespesas
                    : 0
                )}
              </p>
              <p className="text-dark-500 text-sm mt-2">este mês</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Gastos por Categoria
            </h2>
            {resumoMensal && resumoMensal.porCategoria.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resumoMensal.porCategoria}
                        dataKey="total"
                        nameKey="categoriaNome"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {resumoMensal.porCategoria.map((entry, index) => (
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

                {/* Legend with values */}
                <div className="space-y-3">
                  {resumoMensal.porCategoria.map((cat) => (
                    <div
                      key={cat.categoriaId}
                      className="flex items-center justify-between p-3 bg-dark-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.categoriaCor }}
                        />
                        <span className="text-white">{cat.categoriaNome}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(cat.total)}
                        </p>
                        <p className="text-dark-500 text-sm">
                          {cat.percentual.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-dark-500">
                Nenhuma despesa neste mês
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Annual View */
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <p className="text-dark-400 text-sm">Total do Ano</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(resumoAnual?.total ?? 0)}
              </p>
              <p className="text-dark-500 text-sm mt-2">
                {resumoAnual?.quantidadeDespesas ?? 0} despesas
              </p>
            </div>

            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <p className="text-dark-400 text-sm">Média Mensal</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency((resumoAnual?.total ?? 0) / 12)}
              </p>
              <p className="text-dark-500 text-sm mt-2">por mês</p>
            </div>

            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <p className="text-dark-400 text-sm">Média por Despesa</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(
                  resumoAnual && resumoAnual.quantidadeDespesas > 0
                    ? resumoAnual.total / resumoAnual.quantidadeDespesas
                    : 0
                )}
              </p>
              <p className="text-dark-500 text-sm mt-2">no ano</p>
            </div>
          </div>

          {/* Monthly Evolution Chart */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Evolução Mensal
            </h2>
            {resumoAnual && resumoAnual.porMes.some((m) => m.total > 0) ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resumoAnual.porMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="mesNome"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => value.substring(0, 3)}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={formatCurrencyShort}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Total']}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-dark-500">
                Nenhuma despesa neste ano
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4">
                Distribuição por Categoria
              </h2>
              {resumoAnual && resumoAnual.porCategoria.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resumoAnual.porCategoria}
                        dataKey="total"
                        nameKey="categoriaNome"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {resumoAnual.porCategoria.map((entry, index) => (
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
                  Sem dados
                </div>
              )}
            </div>

            {/* Category List */}
            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4">
                Ranking de Categorias
              </h2>
              {resumoAnual && resumoAnual.porCategoria.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {resumoAnual.porCategoria.map((cat, index) => (
                    <div
                      key={cat.categoriaId}
                      className="flex items-center justify-between p-3 bg-dark-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-dark-500 font-medium w-6">
                          #{index + 1}
                        </span>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.categoriaCor }}
                        />
                        <span className="text-white">{cat.categoriaNome}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(cat.total)}
                        </p>
                        <p className="text-dark-500 text-sm">
                          {cat.percentual.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-dark-500">
                  Sem dados
                </div>
              )}
            </div>
          </div>

          {/* Line Chart - Trend */}
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Tendência de Gastos
            </h2>
            {resumoAnual && resumoAnual.porMes.some((m) => m.total > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resumoAnual.porMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="mesNome"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => value.substring(0, 3)}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={formatCurrencyShort}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Total']}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-dark-500">
                Sem dados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
