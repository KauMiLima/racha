import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import TimesApp from './TimesApp'

function App() {
  // undefined = ainda verificando | null = deslogado | objeto = logado
  const [sessao, setSessao] = useState(undefined)

  useEffect(() => {
    if (!supabase) return

    // Verifica se já existe alguém logado neste aparelho e confirma com o
    // servidor que a sessão é válida (evita sessões falsas ou revogadas)
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return setSessao(null)

      const { error } = await supabase.auth.getUser()
      const recusada = error && (error.status === 401 || error.status === 403)
      if (recusada) {
        await supabase.auth.signOut({ scope: 'local' })
        return setSessao(null)
      }
      // Sem internet o servidor não responde: mantém a sessão salva
      setSessao(data.session)
    })

    // Fica escutando login e logout para trocar de tela sozinho
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) return <ConfiguracaoPendente />
  if (sessao === undefined) return <main className="carregando">Carregando...</main>
  if (!sessao) return <Login />

  return <TimesApp usuario={sessao.user} onSair={() => supabase.auth.signOut()} />
}

function ConfiguracaoPendente() {
  return (
    <main>
      <section className="card">
        <h2>Falta conectar o Supabase</h2>
        <p className="info">
          Preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> no
          arquivo <code>.env.local</code> e reinicie o <code>npm run dev</code>.
        </p>
      </section>
    </main>
  )
}

export default App
