import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Simbolo } from './Marca'

// Mensagens de erro do Supabase traduzidas
function traduzirErro(mensagem = '') {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (mensagem.includes('already registered')) return 'Já existe uma conta com esse e-mail.'
  if (mensagem.includes('Email not confirmed'))
    return 'Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.'
  if (mensagem.includes('Password should be')) return 'A senha é muito curta ou fraca.'
  if (mensagem.includes('rate limit') || mensagem.includes('security purposes'))
    return 'Muitas tentativas seguidas. Espere um pouco e tente de novo.'
  if (mensagem.includes('Failed to fetch')) return 'Sem conexão. Verifique sua internet.'
  return mensagem || 'Algo deu errado. Tente de novo.'
}

export default function Login() {
  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastro'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const cadastro = modo === 'cadastro'

  function trocarModo(novo) {
    setModo(novo)
    setErro('')
    setAviso('')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')

    if (cadastro && senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (cadastro && senha !== confirmar) {
      setErro('As senhas não conferem.')
      return
    }

    setCarregando(true)
    try {
      if (cadastro) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome: nome.trim() } },
        })
        if (error) throw error

        // Se o Supabase pede confirmação por e-mail, ainda não há sessão
        if (!data.session) {
          setAviso('Conta criada! Enviamos um link de confirmação para o seu e-mail. Depois é só entrar.')
          setModo('entrar')
          setSenha('')
          setConfirmar('')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
      }
      // Quando o login dá certo, o App.jsx percebe a nova sessão e troca de tela sozinho
    } catch (err) {
      setErro(traduzirErro(err.message))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth">
      <div className="auth-topo">
        <Simbolo tamanho={72} />
        <h1 className="marca-nome">racha</h1>
      </div>

      <section className="card">
        <div className="abas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!cadastro}
            className={!cadastro ? 'ativa' : ''}
            onClick={() => trocarModo('entrar')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cadastro}
            className={cadastro ? 'ativa' : ''}
            onClick={() => trocarModo('cadastro')}
          >
            Criar conta
          </button>
        </div>

        <form className="form" onSubmit={enviar}>
          {cadastro && (
            <label className="campo">
              Nome
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="campo">
            E-mail
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="campo">
            Senha
            <div className="senha">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={cadastro ? 'new-password' : 'current-password'}
                minLength={cadastro ? 8 : undefined}
                required
              />
              <button
                type="button"
                className="ver-senha"
                onClick={() => setMostrarSenha((v) => !v)}
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {cadastro && (
            <label className="campo">
              Confirmar senha
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          {erro && (
            <p className="erro" role="alert">
              {erro}
            </p>
          )}
          {aviso && (
            <p className="sucesso" role="status">
              {aviso}
            </p>
          )}

          <button type="submit" className="primario" disabled={carregando}>
            {carregando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
