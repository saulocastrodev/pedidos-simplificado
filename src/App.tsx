import React, { useState, useEffect } from 'react';
import { Building2, Users, FileText, Package, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// Tipos TypeScript
interface Cidade {
  id: string;
  nome: string;
  estado: string;
  created_at: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade_id: string;
  created_at: string;
}

interface Opcional {
  id: string;
  produto_id: string;
  nome: string;
  valor_adicional: number;
  created_at: string;
}

interface Produto {
  id: string;
  nome: string;
  valor_base: number;
  descricao: string;
  created_at: string;
  opcionais: Opcional[];
}

// interface Proposta {
//   id: string;
//   clienteId: string;
//   produtoId: string;
//   quantidade: number;
//   dataInicio: string;
//   opcionaisSelecionados: string[];
//   valorTotal: number;
//   status: 'pendente' | 'aprovada' | 'rejeitada';
//   observacoes: string;
//   createdAt: Date;
// }

function App() {
  const [activeTab, setActiveTab] = useState<'cidades' | 'clientes' | 'produtos'>('cidades');
  const [selectedCidade, setSelectedCidade] = useState<string>('');
  // const [selectedCliente, setSelectedCliente] = useState<string>('');
  
  // Estados dos dados
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // // Estados de filtros e paginação
  // const [filtroData, setFiltroData] = useState('');
  // const [searchTerm, setSearchTerm] = useState('');
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 30;

  // Estados dos modais
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  // const [showPropostaModal, setShowPropostaModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadCidades(),
        loadClientes(),
        loadProdutos()
      ]);
    } catch (err) {
      setError('Erro ao carregar dados iniciais');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCidades = async () => {
    const { data, error } = await supabase
      .from('cidades')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    setCidades(data || []);
  };

  const loadClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    setClientes(data || []);
  };

  const loadProdutos = async () => {
    const { data: produtosData, error: produtosError } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');
    
    if (produtosError) throw produtosError;

    const { data: opcionaisData, error: opcionaisError } = await supabase
      .from('opcionais')
      .select('*')
      .order('nome');
    
    if (opcionaisError) throw opcionaisError;

    const produtosComOpcionais = (produtosData || []).map(produto => ({
      ...produto,
      opcionais: (opcionaisData || []).filter(opcional => opcional.produto_id === produto.id)
    }));

    setProdutos(produtosComOpcionais);
  };

  // // Funções para calcular valor da proposta
  // const calcularValorProposta = (produtoId: string, quantidade: number, opcionaisSelecionados: string[]) => {
  //   const produto = produtos.find(p => p.id === produtoId);
  //   if (!produto) return 0;

  //   const valorOpcionais = opcionaisSelecionados.reduce((total, opcionalId) => {
  //     const opcional = produto.opcionais.find(o => o.id === opcionalId);
  //     return total + (opcional?.valor_adicional || 0);
  //   }, 0);

  //   return (produto.valor_base + valorOpcionais) * quantidade;
  // };

  // // Filtrar propostas
  // const propostasFiltradas = propostas.filter(proposta => {
  //   const matchesData = !filtroData || proposta.dataInicio >= filtroData;
  //   const cliente = clientes.find(c => c.id === proposta.clienteId);
  //   const matchesSearch = !searchTerm || cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
  //   return matchesData && matchesSearch;
  // });

  // const totalPages = Math.ceil(propostasFiltradas.length / itemsPerPage);
  // const propostasPaginadas = propostasFiltradas.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // Componente Modal Cidade
  const CidadeModal = () => {
    const [formData, setFormData] = useState({ nome: '', estado: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      try {
        const { data, error } = await supabase
          .from('cidades')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        
        setCidades([...cidades, data]);
        setShowCidadeModal(false);
        setFormData({ nome: '', estado: '' });
      } catch (err) {
        setError('Erro ao salvar cidade');
        console.error('Erro:', err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nova Cidade</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <input
                type="text"
                required
                maxLength={2}
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCidadeModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente Modal Cliente
  const ClienteModal = () => {
    const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', endereco: '', cidade_id: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      try {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ ...formData, cidade_id: selectedCidade }])
          .select()
          .single();
        
        if (error) throw error;
        
        setClientes([...clientes, data]);
        setShowClienteModal(false);
        setFormData({ nome: '', email: '', telefone: '', endereco: '', cidade_id: '' });
      } catch (err) {
        setError('Erro ao salvar cliente');
        console.error('Erro:', err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Novo Cliente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/*<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                required
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>*/}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowClienteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // // Componente Modal Proposta
  // const PropostaModal = () => {
  //   const [formData, setFormData] = useState({
  //     produtoId: '',
  //     quantidade: 1,
  //     dataInicio: '',
  //     opcionaisSelecionados: [] as string[],
  //     observacoes: ''
  //   });

  //   const produto = produtos.find(p => p.id === formData.produtoId);
  //   const valorTotal = calcularValorProposta(formData.produtoId, formData.quantidade, formData.opcionaisSelecionados);

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     const novaProposta: Proposta = {
  //       id: Date.now().toString(),
  //       clienteId: selectedCliente,
  //       valorTotal,
  //       status: 'pendente',
  //       createdAt: new Date(),
  //       ...formData
  //     };
  //     setPropostas([...propostas, novaProposta]);
  //     setShowPropostaModal(false);
  //     setFormData({
  //       produtoId: '',
  //       quantidade: 1,
  //       dataInicio: '',
  //       opcionaisSelecionados: [],
  //       observacoes: ''
  //     });
  //   };

  //   const toggleOpcional = (opcionalId: string) => {
  //     setFormData(prev => ({
  //       ...prev,
  //       opcionaisSelecionados: prev.opcionaisSelecionados.includes(opcionalId)
  //         ? prev.opcionaisSelecionados.filter(id => id !== opcionalId)
  //         : [...prev.opcionaisSelecionados, opcionalId]
  //     }));
  //   };

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
  //       <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
  //         <h3 className="text-lg font-semibold mb-4">Nova Proposta</h3>
  //         <form onSubmit={handleSubmit} className="space-y-4">
  //           <div className="grid grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
  //               <select
  //                 required
  //                 value={formData.produtoId}
  //                 onChange={(e) => setFormData({...formData, produtoId: e.target.value, opcionaisSelecionados: []})}
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  //               >
  //                 <option value="">Selecione um produto</option>
  //                 {produtos.map(produto => (
  //                   <option key={produto.id} value={produto.id}>{produto.nome} - R$ {produto.valor_base.toFixed(2)}</option>
  //                 ))}
  //               </select>
  //             </div>
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
  //               <input
  //                 type="number"
  //                 min="1"
  //                 required
  //                 value={formData.quantidade}
  //                 onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  //               />
  //             </div>
  //           </div>
            
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
  //             <input
  //               type="date"
  //               required
  //               value={formData.dataInicio}
  //               onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
  //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  //             />
  //           </div>

  //           {produto && produto.opcionais.length > 0 && (
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Opcionais</label>
  //               <div className="space-y-2 max-h-32 overflow-y-auto">
  //                 {produto.opcionais.map(opcional => (
  //                   <label key={opcional.id} className="flex items-center space-x-2 cursor-pointer">
  //                     <input
  //                       type="checkbox"
  //                       checked={formData.opcionaisSelecionados.includes(opcional.id)}
  //                       onChange={() => toggleOpcional(opcional.id)}
  //                       className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  //                     />
  //                     <span className="text-sm">
  //                       {opcional.nome} (+R$ {opcional.valor_adicional.toFixed(2)})
  //                     </span>
  //                   </label>
  //                 ))}
  //               </div>
  //             </div>
  //           )}

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
  //             <textarea
  //               value={formData.observacoes}
  //               onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
  //               rows={3}
  //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  //             />
  //           </div>

  //           {valorTotal > 0 && (
  //             <div className="bg-gray-50 p-4 rounded-md">
  //               <div className="text-lg font-semibold text-gray-800">
  //                 Valor Total: R$ {valorTotal.toFixed(2)}
  //               </div>
  //             </div>
  //           )}

  //           <div className="flex justify-end space-x-3">
  //             <button
  //               type="button"
  //               onClick={() => setShowPropostaModal(false)}
  //               className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
  //             >
  //               Cancelar
  //             </button>
  //             <button
  //               type="submit"
  //               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  //             >
  //               Salvar
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // };

  // Componente Modal Produto
  const ProdutoModal = () => {
    const [formData, setFormData] = useState({
      nome: '',
      valor_base: 0,
      descricao: '',
      opcionais: [] as { nome: string; valor_adicional: number }[]
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      try {
        // Inserir produto
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .insert([{
            nome: formData.nome,
            valor_base: formData.valor_base,
            descricao: formData.descricao
          }])
          .select()
          .single();
        
        if (produtoError) throw produtoError;

        // Inserir opcionais se existirem
        let opcionaisData: Opcional[] = [];
        if (formData.opcionais.length > 0) {
          const { data: opcionais, error: opcionaisError } = await supabase
            .from('opcionais')
            .insert(
              formData.opcionais.map(opcional => ({
                produto_id: produto.id,
                nome: opcional.nome,
                valor_adicional: opcional.valor_adicional
              }))
            )
            .select();
          
          if (opcionaisError) throw opcionaisError;
          opcionaisData = opcionais || [];
        }

        const novoProduto: Produto = {
          ...produto,
          opcionais: opcionaisData
        };

        setProdutos([...produtos, novoProduto]);
        setShowProdutoModal(false);
        setFormData({
          nome: '',
          valor_base: 0,
          descricao: '',
          opcionais: []
        });
      } catch (err) {
        setError('Erro ao salvar produto');
        console.error('Erro:', err);
      } finally {
        setSaving(false);
      }
    };

    const adicionarOpcional = () => {
      setFormData(prev => ({
        ...prev,
        opcionais: [...prev.opcionais, { nome: '', valor_adicional: 0 }]
      }));
    };

    const removerOpcional = (index: number) => {
      setFormData(prev => ({
        ...prev,
        opcionais: prev.opcionais.filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
          <h3 className="text-lg font-semibold mb-4">Novo Produto</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Base</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.valor_base}
                  onChange={(e) => setFormData({...formData, valor_base: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                required
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Opcionais</label>
                <button
                  type="button"
                  onClick={adicionarOpcional}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  + Adicionar
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.opcionais.map((opcional, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <input
                      type="text"
                      placeholder="Nome do opcional"
                      value={opcional.nome}
                      onChange={(e) => {
                        const newOpcionais = [...formData.opcionais];
                        newOpcionais[index].nome = e.target.value;
                        setFormData({...formData, opcionais: newOpcionais});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      min="0"
                      step="0.01"
                      value={opcional.valor_adicional}
                      onChange={(e) => {
                        const newOpcionais = [...formData.opcionais];
                        newOpcionais[index].valor_adicional = parseFloat(e.target.value);
                        setFormData({...formData, opcionais: newOpcionais});
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removerOpcional(index)}
                      className="px-2 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProdutoModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Fechar</span>
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Propostas</h1>
            </div>
            {loading && (
              <div className="flex items-center text-gray-600">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Carregando...
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          {[
            { id: 'cidades', label: 'Cidades', icon: Building2 },
            { id: 'clientes', label: 'Clientes', icon: Users },
            // { id: 'propostas', label: 'Propostas', icon: FileText },
            { id: 'produtos', label: 'Produtos', icon: Package }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>

        {/* Breadcrumb */}
        {selectedCidade && (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <span>{cidades.find(c => c.id === selectedCidade)?.nome}</span>
          </nav>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Cidades */}
          {activeTab === 'cidades' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Cidades</h2>
                <button
                  onClick={() => setShowCidadeModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Cidade
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cidades.map(cidade => (
                  <div
                    key={cidade.id}
                    onClick={() => {
                      setSelectedCidade(cidade.id);
                      setActiveTab('clientes');
                    }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{cidade.nome}</h3>
                        <p className="text-sm text-gray-600">{cidade.estado}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {clientes.filter(c => c.cidade_id === cidade.id).length} clientes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clientes */}
          {activeTab === 'clientes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Clientes {selectedCidade && `- ${cidades.find(c => c.id === selectedCidade)?.nome}`}
                </h2>
                <button
                  onClick={() => setShowClienteModal(true)}
                  disabled={!selectedCidade}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </button>
              </div>

              {!selectedCidade && (
                <div className="text-center py-8 text-gray-500">
                  Selecione uma cidade primeiro
                </div>
              )}

              {selectedCidade && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientes
                    .filter(cliente => cliente.cidade_id === selectedCidade)
                    .map(cliente => (
                      <div
                        key={cliente.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow hover:border-blue-300"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                          <p className="text-sm text-gray-600">{cliente.email}</p>
                          <p className="text-sm text-gray-600">{cliente.telefone}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Propostas - Comentado temporariamente */}
          {/* {activeTab === 'propostas' && (
            // ... código das propostas comentado
          )} */}

          {/* Produtos */}
          {activeTab === 'produtos' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Produtos</h2>
                <button
                  onClick={() => setShowProdutoModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {produtos.map(produto => (
                  <div key={produto.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{produto.nome}</h3>
                        <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          R$ {produto.valor_base.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {produto.opcionais.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Opcionais disponíveis:</h4>
                        <div className="space-y-1">
                          {produto.opcionais.map(opcional => (
                            <div key={opcional.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">• {opcional.nome}</span>
                              <span className="text-green-600 font-medium">
                                +R$ {opcional.valor_adicional.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {showCidadeModal && <CidadeModal />}
      {showClienteModal && <ClienteModal />}
      {/* {showPropostaModal && <PropostaModal />} */}
      {showProdutoModal && <ProdutoModal />}
    </div>
  );
}

export default App;