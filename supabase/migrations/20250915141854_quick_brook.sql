/*
  # Schema inicial para Sistema de Propostas

  1. Novas Tabelas
    - `cidades`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `estado` (text, 2 caracteres)
      - `created_at` (timestamp)
    
    - `clientes`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `email` (text, unique)
      - `telefone` (text)
      - `cidade_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `produtos`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `valor_base` (numeric)
      - `descricao` (text)
      - `created_at` (timestamp)
    
    - `opcionais`
      - `id` (uuid, primary key)
      - `produto_id` (uuid, foreign key)
      - `nome` (text)
      - `valor_adicional` (numeric)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados
*/

-- Criar tabela de cidades
CREATE TABLE IF NOT EXISTS cidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  estado text NOT NULL CHECK (length(estado) = 2),
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text NOT NULL,
  cidade_id uuid NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  valor_base numeric(10,2) NOT NULL DEFAULT 0,
  descricao text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de opcionais
CREATE TABLE IF NOT EXISTS opcionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  valor_adicional numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcionais ENABLE ROW LEVEL SECURITY;

-- Políticas para cidades
CREATE POLICY "Permitir leitura de cidades para todos"
  ON cidades
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de cidades para usuários autenticados"
  ON cidades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de cidades para usuários autenticados"
  ON cidades
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para clientes
CREATE POLICY "Permitir leitura de clientes para todos"
  ON clientes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de clientes para usuários autenticados"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes para usuários autenticados"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para produtos
CREATE POLICY "Permitir leitura de produtos para todos"
  ON produtos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de produtos para usuários autenticados"
  ON produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos para usuários autenticados"
  ON produtos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para opcionais
CREATE POLICY "Permitir leitura de opcionais para todos"
  ON opcionais
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de opcionais para usuários autenticados"
  ON opcionais
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de opcionais para usuários autenticados"
  ON opcionais
  FOR UPDATE
  TO authenticated
  USING (true);

-- Inserir dados iniciais
INSERT INTO produtos (nome, valor_base, descricao) VALUES
  ('Website Básico', 2500.00, 'Site institucional com até 5 páginas'),
  ('E-commerce', 5000.00, 'Loja virtual completa')
ON CONFLICT DO NOTHING;

-- Inserir opcionais para os produtos
DO $$
DECLARE
  website_id uuid;
  ecommerce_id uuid;
BEGIN
  SELECT id INTO website_id FROM produtos WHERE nome = 'Website Básico' LIMIT 1;
  SELECT id INTO ecommerce_id FROM produtos WHERE nome = 'E-commerce' LIMIT 1;
  
  IF website_id IS NOT NULL THEN
    INSERT INTO opcionais (produto_id, nome, valor_adicional) VALUES
      (website_id, 'SEO Básico', 500.00),
      (website_id, 'Blog integrado', 800.00),
      (website_id, 'Formulário de contato avançado', 300.00)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF ecommerce_id IS NOT NULL THEN
    INSERT INTO opcionais (produto_id, nome, valor_adicional) VALUES
      (ecommerce_id, 'Gateway de pagamento', 1000.00),
      (ecommerce_id, 'Sistema de cupons', 600.00),
      (ecommerce_id, 'Relatórios avançados', 1200.00)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;