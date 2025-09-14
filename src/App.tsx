import React, { useState, useEffect } from 'react';
import { Building2, Users, FileText, Package, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// Tipos TypeScript
interface Cidade {
  id: string;
  nome: string;
  estado: string;
  createdAt: Date;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidadeId: string;
  createdAt: Date;
}

interface Opcional {
  id: string;
  nome: string;
  valorAdicional: number;
}

interface Produto {
  id: string;
  nome: string;
  valorBase: number;
  descricao: string;
  opcionais: Opcional[];
}

interface Proposta {
  id: string;
  clienteId: string;
  produtoId: string;
  quantidade: number;
  dataInicio: string;
  opcionaisSelecionados: string[];
  valorTotal: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  observacoes: string;
  createdAt: Date;
}

function App() {
  const [activeTab, setActiveTab] = useState<'cidades' | 'clientes' | 'propostas' | 'produtos'>('cidades');
  const [selectedCidade, setSelectedCidade] = useState<string>('');
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  
  // Estados dos dados
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Estados de filtros e paginação
  const [filtroData, setFiltroData] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Estados dos modais
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showPropostaModal, setShowPropostaModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  // Inicializar dados de exemplo
  useEffect(() => {
    const produtosIniciais: Produto[] = [
      {
        id: '1',
        nome: 'Website Básico',
        valorBase: 2500,
        descricao: 'Site institucional com até 5 páginas',
        opcionais: [
          { id: '1', nome: 'SEO Básico', valorAdicional: 500 },
          { id: '2', nome: 'Blog integrado', valorAdicional: 800 },
          { id: '3', nome: 'Formulário de contato avançado', valorAdicional: 300 }
        ]
      },
      {
        id: '2',
        nome: 'E-commerce',
        valorBase: 5000,
        descricao: 'Loja virtual completa',
        opcionais: [
          { id: '4', nome: 'Gateway de pagamento', valorAdicional: 1000 },
          { id: '5', nome: 'Sistema de cupons', valorAdicional: 600 },
          { id: '6', nome: 'Relatórios avançados', valorAdicional: 1200 }
        ]
      }
    ];
    setProdutos(produtosIniciais);

    const cidadesIniciais: Cidade[] = [
      { id: '1', nome: 'São Paulo', estado: 'SP', createdAt: new Date() },
      { id: '2', nome: 'Rio de Janeiro', estado: 'RJ', createdAt: new Date() }
    ];
    setCidades(cidadesIniciais);
  }, []);

  // Funções para calcular valor da proposta
  const calcularValorProposta = (produtoId: string, quantidade: number, opcionaisSelecionados: string[]) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return 0;

    const valorOpcionais = opcionaisSelecionados.reduce((total, opcionalId) => {
      const opcional = produto.opcionais.find(o => o.id === opcionalId);
      return total + (opcional?.valorAdicional || 0);
    }, 0);

    return (produto.valorBase + valorOpcionais) * quantidade;
  };

  // Filtrar propostas
  const propostasFiltradas = propostas.filter(proposta => {
    const matchesData = !filtroData || proposta.dataInicio >= filtroData;
    const cliente = clientes.find(c => c.id === proposta.clienteId);
    const matchesSearch = !searchTerm || cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesData && matchesSearch;
  });

  const totalPages = Math.ceil(propostasFiltradas.length / itemsPerPage);
  const propostasPaginadas = propostasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Componente Modal Cidade
  const CidadeModal = () => {
    const [formData, setFormData] = useState({ nome: '', estado: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const novaCidade: Cidade = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
      };
      setCidades([...cidades, novaCidade]);
      setShowCidadeModal(false);
      setFormData({ nome: '', estado: '' });
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente Modal Cliente
  const ClienteModal = () => {
    const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
        cidadeId: selectedCidade,
        createdAt: new Date()
      };
      setClientes([...clientes, novoCliente]);
      setShowClienteModal(false);
      setFormData({ nome: '', email: '', telefone: '' });
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
            </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente Modal Proposta
  const PropostaModal = () => {
    const [formData, setFormData] = useState({
      produtoId: '',
      quantidade: 1,
      dataInicio: '',
      opcionaisSelecionados: [] as string[],
      observacoes: ''
    });

    const produto = produtos.find(p => p.id === formData.produtoId);
    const valorTotal = calcularValorProposta(formData.produtoId, formData.quantidade, formData.opcionaisSelecionados);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const novaProposta: Proposta = {
        id: Date.now().toString(),
        clienteId: selectedCliente,
        valorTotal,
        status: 'pendente',
        createdAt: new Date(),
        ...formData
      };
      setPropostas([...propostas, novaProposta]);
      setShowPropostaModal(false);
      setFormData({
        produtoId: '',
        quantidade: 1,
        dataInicio: '',
        opcionaisSelecionados: [],
        observacoes: ''
      });
    };

    const toggleOpcional = (opcionalId: string) => {
      setFormData(prev => ({
        ...prev,
        opcionaisSelecionados: prev.opcionaisSelecionados.includes(opcionalId)
          ? prev.opcionaisSelecionados.filter(id => id !== opcionalId)
          : [...prev.opcionaisSelecionados, opcionalId]
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
          <h3 className="text-lg font-semibold mb-4">Nova Proposta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                <select
                  required
                  value={formData.produtoId}
                  onChange={(e) => setFormData({...formData, produtoId: e.target.value, opcionaisSelecionados: []})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>{produto.nome} - R$ {produto.valorBase.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
              <input
                type="date"
                required
                value={formData.dataInicio}
                onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {produto && produto.opcionais.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opcionais</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {produto.opcionais.map(opcional => (
                    <label key={opcional.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.opcionaisSelecionados.includes(opcional.id)}
                        onChange={() => toggleOpcional(opcional.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {opcional.nome} (+R$ {opcional.valorAdicional.toFixed(2)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {valorTotal > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-lg font-semibold text-gray-800">
                  Valor Total: R$ {valorTotal.toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPropostaModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente Modal Produto
  const ProdutoModal = () => {
    const [formData, setFormData] = useState({
      nome: '',
      valorBase: 0,
      descricao: '',
      opcionais: [] as Omit<Opcional, 'id'>[]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const novoProduto: Produto = {
        id: Date.now().toString(),
        ...formData,
        opcionais: formData.opcionais.map((opcional, index) => ({
          ...opcional,
          id: `${Date.now()}-${index}`
        }))
      };
      setProdutos([...produtos, novoProduto]);
      setShowProdutoModal(false);
      setFormData({
        nome: '',
        valorBase: 0,
        descricao: '',
        opcionais: []
      });
    };

    const adicionarOpcional = () => {
      setFormData(prev => ({
        ...prev,
        opcionais: [...prev.opcionais, { nome: '', valorAdicional: 0 }]
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
                  value={formData.valorBase}
                  onChange={(e) => setFormData({...formData, valorBase: parseFloat(e.target.value)})}
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
                      value={opcional.valorAdicional}
                      onChange={(e) => {
                        const newOpcionais = [...formData.opcionais];
                        newOpcionais[index].valorAdicional = parseFloat(e.target.value);
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Propostas</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          {[
            { id: 'cidades', label: 'Cidades', icon: Building2 },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'propostas', label: 'Propostas', icon: FileText },
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
        {(selectedCidade || selectedCliente) && (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            {selectedCidade && (
              <>
                <span>{cidades.find(c => c.id === selectedCidade)?.nome}</span>
                {selectedCliente && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span>{clientes.find(c => c.id === selectedCliente)?.nome}</span>
                  </>
                )}
              </>
            )}
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
                        {clientes.filter(c => c.cidadeId === cidade.id).length} clientes
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
                    .filter(cliente => cliente.cidadeId === selectedCidade)
                    .map(cliente => (
                      <div
                        key={cliente.id}
                        onClick={() => {
                          setSelectedCliente(cliente.id);
                          setActiveTab('propostas');
                        }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                            <p className="text-sm text-gray-600">{cliente.email}</p>
                            <p className="text-sm text-gray-600">{cliente.telefone}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {propostas.filter(p => p.clienteId === cliente.id).length} propostas
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Propostas */}
          {activeTab === 'propostas' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Propostas {selectedCliente && `- ${clientes.find(c => c.id === selectedCliente)?.nome}`}
                </h2>
                <button
                  onClick={() => setShowPropostaModal(true)}
                  disabled={!selectedCliente}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Proposta
                </button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por data de início
                  </label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {!selectedCliente && (
                <div className="text-center py-8 text-gray-500">
                  Selecione um cliente primeiro
                </div>
              )}

              {selectedCliente && (
                <>
                  <div className="space-y-4 mb-6">
                    {propostasPaginadas.map(proposta => {
                      const cliente = clientes.find(c => c.id === proposta.clienteId);
                      const produto = produtos.find(p => p.id === proposta.produtoId);
                      return (
                        <div key={proposta.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-800">{produto?.nome}</h4>
                              <p className="text-sm text-gray-600">{cliente?.nome}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Quantidade: {proposta.quantidade}</p>
                              <p className="text-sm text-gray-600">Data: {proposta.dataInicio}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-lg text-green-600">
                                R$ {proposta.valorTotal.toFixed(2)}
                              </p>
                              <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                                proposta.status === 'aprovada' ? 'bg-green-100 text-green-800' :
                                proposta.status === 'rejeitada' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {proposta.status}
                              </p>
                            </div>
                            <div>
                              {proposta.opcionaisSelecionados.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Opcionais:</p>
                                  {proposta.opcionaisSelecionados.map(opcionalId => {
                                    const opcional = produto?.opcionais.find(o => o.id === opcionalId);
                                    return opcional ? (
                                      <p key={opcionalId} className="text-xs text-gray-600">
                                        • {opcional.nome}
                                      </p>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          {proposta.observacoes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600">{proposta.observacoes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </button>
                      
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages} • {propostasFiltradas.length} propostas
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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
                          R$ {produto.valorBase.toFixed(2)}
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
                                +R$ {opcional.valorAdicional.toFixed(2)}
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
      {showPropostaModal && <PropostaModal />}
      {showProdutoModal && <ProdutoModal />}
    </div>
  );
}

export default App;