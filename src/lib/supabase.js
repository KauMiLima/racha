import { createClient } from '@supabase/supabase-js'

// As chaves ficam no arquivo .env.local (que não vai para o GitHub)
const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Se as chaves ainda não foram configuradas, o app mostra um aviso em vez de quebrar
export const supabase = url && chave ? createClient(url, chave) : null
