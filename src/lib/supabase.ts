import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      cidades: {
        Row: {
          id: string
          nome: string
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          estado: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          estado?: string
          created_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string
          cidade_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone: string
          cidade_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string
          cidade_id?: string
          created_at?: string
        }
      }
      produtos: {
        Row: {
          id: string
          nome: string
          valor_base: number
          descricao: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          valor_base: number
          descricao: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          valor_base?: number
          descricao?: string
          created_at?: string
        }
      }
      opcionais: {
        Row: {
          id: string
          produto_id: string
          nome: string
          valor_adicional: number
          created_at: string
        }
        Insert: {
          id?: string
          produto_id: string
          nome: string
          valor_adicional: number
          created_at?: string
        }
        Update: {
          id?: string
          produto_id?: string
          nome?: string
          valor_adicional?: number
          created_at?: string
        }
      }
    }
  }
}