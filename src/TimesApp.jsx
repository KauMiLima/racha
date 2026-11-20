import { useEffect, useState } from 'react'
import { parseLista } from './utils/parseLista'
import { balancearTimes } from './utils/balancear'
import TimesEditaveis from './components/TimesEditaveis'
import { Marca } from './components/Marca'
import { textoDosTimes, copiarTexto } from './utils/copiarTimes'
import {
  carregarNotas,
  salvarNotas,
  carregarRegras,
  salvarRegras,
  carregarLevantadores,
  salvarLevantadores,
  carregarMulheres,
  salvarMulheres,
} from './utils/notas'

const NOTA_PADRAO = 5
const SIMBOLO_MULHER = '♀\uFE0E' // \uFE0E evita que o celular mostre como emoji

const chave = (nome) => nome.toLowerCase()
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`

// Duas regras são do mesmo par se envolvem as mesmas duas pessoas
const mesmoPar = (r, s) =>
  [chave(r.a), chave(r.b)].sort().join('|') === [chave(s.a), chave(s.b)].sort().join('|')

export default function TimesApp({ usuario, onSair }) {
  const [texto, setTexto] = useState('')
  const [nomes, setNomes] = useState([])
  const [notas, setNotas] = useState(carregarNotas)
  const [regras, setRegras] = useState(carregarRegras)
  const [levantadores, setLevantadores] = useState(carregarLevantadores)
  const [mulheres, setMulheres] = useState(carregarMulheres)
  const [numTimes, setNumTimes] = useState(3)
  const [times, setTimes] = useState(null)
  const [copiado, setCopiado] = useState(null) // null | 'ok' | 'erro'

  // Formulário de nova regra
  const [regraA, setRegraA] = useState('')
  const [regraB, setRegraB] = useState('')
  const [tipoRegra, setTipoRegra] = useState('juntos')

  useEffect(() => salvarNotas(notas), [notas])
  useEffect(() => salvarRegras(regras), [regras])
  useEffect(() => salvarLevantadores(levantadores), [levantadores])
  useEffect(() => salvarMulheres(mulheres), [mulheres])

  const notaDe = (nome) => notas[chave(nome)] ?? NOTA_PADRAO
  const ehLevantador = (nome) => levantadores.includes(chave(nome))
  const ehMulher = (nome) => mulheres.includes(chave(nome))

  const levantadoresHoje = nomes.filter(ehLevantador).length
  const mulheresHoje = nomes.filter(ehMulher).length

  // Quem está na lista de hoje (chave em minúsculas → nome como aparece)
  const presentes = new Map(nomes.map((n) => [chave(n), n]))
  const regraAtiva = (r) => presentes.has(chave(r.a)) && presentes.has(chave(r.b))

  function lerLista() {
    setNomes(parseLista(texto))
    setTimes(null)
  }

  function mudarNota(nome, valor) {
    const nota = Math.min(10, Math.max(1, valor))
    setNotas((atual) => ({ ...atual, [chave(nome)]: nota }))
  }

  // Liga/desliga uma marcação (levantador ou mulher)
  function alternar(setLista, nome) {
    const k = chave(nome)
    setLista((atual) => (atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k]))
    setTimes(null)
  }

  function remover(nome) {
    setNomes((atual) => atual.filter((n) => n !== nome))
    setTimes(null)
  }

  function adicionarRegra() {
    const nova = { tipo: tipoRegra, a: regraA, b: regraB }
    // Se já existe regra para esse par, substitui
    setRegras((atual) => [...atual.filter((r) => !mesmoPar(r, nova)), nova])
    setRegraA('')
    setRegraB('')
    setTimes(null)
  }

  function removerRegra(alvo) {
    setRegras((atual) => atual.filter((r) => r !== alvo))
    setTimes(null)
  }

  async function copiarTimes() {
    const ok = await copiarTexto(textoDosTimes(times))
    setCopiado(ok ? 'ok' : 'erro')
    setTimeout(() => setCopiado(null), 2000)
  }

  function dividir() {
    const jogadores = nomes.map((nome) => ({
      nome,
      nota: notaDe(nome),
      levantador: ehLevantador(nome),
      mulher: ehMulher(nome),
    }))
    const ativas = regras.filter(regraAtiva)
    const par = (r) => [presentes.get(chave(r.a)), presentes.get(chave(r.b))]

    setTimes(
      balancearTimes(jogadores, numTimes, {
        juntos: ativas.filter((r) => r.tipo === 'juntos').map(par),
        separados: ativas.filter((r) => r.tipo === 'separados').map(par),
      })
    )
  }

  return (
    <main>
      <header className="topo">
        <div>
          <h1 className="titulo-app">
            <Marca />
          </h1>
        </div>
        <button className="sair" onClick={onSair}>
          Sair de {usuario.user_metadata?.nome || usuario.email}
        </button>
      </header>

      {/* 1. Colar a lista */}
      <section className="card">
        <h2 className="passo">Lista do grupo
        </h2>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui a lista do grupo..."
        />
        <button className="escuro" onClick={lerLista} disabled={!texto.trim()}>
          Ler lista
        </button>
      </section>

      {nomes.length > 0 && (
        <>
          {/* 2. Jogadores, marcações e notas */}
          <section className="card">
            <h2 className="passo">Jogadores
              <span className="contagem">{nomes.length}</span>
            </h2>
            <p className="info">
              Nota de 1 a 10. L para levantador, {SIMBOLO_MULHER} para mulher.
            </p>
            <ul className="lista">
              {nomes.map((nome) => (
                <li key={nome} className="jogador">
                  <span className="nome">
                    {nome}
                    {!(chave(nome) in notas) && <span className="tag">novo</span>}
                  </span>
                  <button
                    className={`lev ${ehLevantador(nome) ? 'ativo' : ''}`}
                    onClick={() => alternar(setLevantadores, nome)}
                    aria-label={`Marcar ${nome} como levantador`}
                    aria-pressed={ehLevantador(nome)}
                  >
                    L
                  </button>
                  <button
                    className={`lev ${ehMulher(nome) ? 'ativo' : ''}`}
                    onClick={() => alternar(setMulheres, nome)}
                    aria-label={`Marcar ${nome} como mulher`}
                    aria-pressed={ehMulher(nome)}
                  >
                    {SIMBOLO_MULHER}
                  </button>
                  <div className="nota">
                    <button onClick={() => mudarNota(nome, notaDe(nome) - 1)}>−</button>
                    <span>{notaDe(nome)}</span>
                    <button onClick={() => mudarNota(nome, notaDe(nome) + 1)}>+</button>
                  </div>
                  <button
                    className="remover"
                    onClick={() => remover(nome)}
                    aria-label={`Remover ${nome}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Regras */}
          <section className="card">
            <h2 className="passo">Regras
            </h2>
            <div className="regra-form">
              <select value={regraA} onChange={(e) => setRegraA(e.target.value)}>
                <option value="">Jogador</option>
                {nomes.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <select value={tipoRegra} onChange={(e) => setTipoRegra(e.target.value)}>
                <option value="juntos">joga junto com</option>
                <option value="separados">fica separado de</option>
              </select>
              <select value={regraB} onChange={(e) => setRegraB(e.target.value)}>
                <option value="">Jogador</option>
                {nomes
                  .filter((n) => n !== regraA)
                  .map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
              </select>
              <button
                className="secundario"
                onClick={adicionarRegra}
                disabled={!regraA || !regraB || regraA === regraB}
              >
                Adicionar regra
              </button>
            </div>

            {regras.length > 0 && (
              <ul className="lista">
                {regras.map((r) => (
                  <li
                    key={`${r.tipo}-${r.a}-${r.b}`}
                    className={`regra ${regraAtiva(r) ? '' : 'inativa'}`}
                  >
                    <span>
                      {r.a} {r.tipo === 'juntos' ? 'joga junto com' : 'fica separado de'} {r.b}
                      {!regraAtiva(r) && ' (ausente hoje)'}
                    </span>
                    <button
                      className="remover"
                      onClick={() => removerRegra(r)}
                      aria-label="Remover regra"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 4. Dividir */}
          <section className="card">
            <label className="linha">
              Número de times
              <select value={numTimes} onChange={(e) => setNumTimes(Number(e.target.value))}>
                {[2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <p className="info">
              {plural(levantadoresHoje, 'levantador', 'levantadores')} e{' '}
              {plural(mulheresHoje, 'mulher', 'mulheres')} na lista.
            </p>
            {levantadoresHoje < numTimes && (
              <p className="aviso">
                Faltam levantadores: com {numTimes} times, pelo menos um vai jogar sem.
              </p>
            )}
            <button className="primario" onClick={dividir} disabled={nomes.length < numTimes}>
              Dividir times
            </button>
          </section>
        </>
      )}

      {/* 5. Resultado */}
      {times && (
        <>
          <TimesEditaveis times={times} onChange={setTimes} simboloMulher={SIMBOLO_MULHER} />
          <button className="primario" onClick={copiarTimes}>
            {copiado === 'ok'
              ? 'Times copiados! ✓'
              : copiado === 'erro'
                ? 'Não deu para copiar'
                : 'Copiar times'}
          </button>
          <button className="secundario" onClick={dividir}>
            Sortear de novo
          </button>
        </>
      )}
    </main>
  )
}
