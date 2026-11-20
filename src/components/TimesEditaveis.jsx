import { useEffect, useRef, useState } from 'react'
import { resumirTime } from '../utils/balancear'

// Mostra os times e deixa arrastar jogadores entre eles.
// Funciona com mouse e com o dedo (pointer events).
// - Soltar em cima de um jogador de outro time → os dois trocam de lugar
// - Soltar numa área vazia do outro time → o jogador só muda de time
export default function TimesEditaveis({ times, onChange, simboloMulher }) {
  const [arrasto, setArrasto] = useState(null)
  const arrastoRef = useRef(null)
  const ponteiroY = useRef(0)
  const arrastando = arrasto !== null

  // Rola a página sozinha quando o dedo chega perto da borda da tela
  useEffect(() => {
    if (!arrastando) return
    let quadro
    const rolar = () => {
      const y = ponteiroY.current
      const margem = 80
      if (y < margem) window.scrollBy(0, -(margem - y) / 4)
      else if (y > window.innerHeight - margem)
        window.scrollBy(0, (y - (window.innerHeight - margem)) / 4)
      quadro = requestAnimationFrame(rolar)
    }
    quadro = requestAnimationFrame(rolar)
    return () => cancelAnimationFrame(quadro)
  }, [arrastando])

  // Descobre sobre qual time (e qual jogador) o dedo está
  function localizarAlvo(x, y) {
    const el = document.elementFromPoint(x, y)
    const timeEl = el?.closest('[data-time]')
    const jogadorEl = el?.closest('[data-jogador]')
    return {
      alvoTime: timeEl ? Number(timeEl.dataset.time) : null,
      alvoJogador: jogadorEl ? jogadorEl.dataset.jogador : null,
    }
  }

  function aplicar({ nome, origem, alvoTime, alvoJogador }) {
    if (alvoTime === null || alvoTime === origem) return

    const novos = times.map((t) => [...t.jogadores])
    const i = novos[origem].findIndex((j) => j.nome === nome)
    const [movido] = novos[origem].splice(i, 1)

    if (alvoJogador) {
      // Troca: quem estava no outro time vem para o lugar de quem saiu
      const k = novos[alvoTime].findIndex((j) => j.nome === alvoJogador)
      const [trocado] = novos[alvoTime].splice(k, 1, movido)
      novos[origem].splice(i, 0, trocado)
    } else {
      novos[alvoTime].push(movido)
    }

    onChange(novos.map(resumirTime))
  }

  function iniciar(e, nome, origem) {
    e.preventDefault()
    const inicial = { nome, origem, x: e.clientX, y: e.clientY, alvoTime: origem, alvoJogador: null }
    arrastoRef.current = inicial
    ponteiroY.current = e.clientY
    setArrasto(inicial)

    const mover = (ev) => {
      ponteiroY.current = ev.clientY
      const atual = {
        ...arrastoRef.current,
        x: ev.clientX,
        y: ev.clientY,
        ...localizarAlvo(ev.clientX, ev.clientY),
      }
      arrastoRef.current = atual
      setArrasto(atual)
    }

    const soltar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      const final = arrastoRef.current
      arrastoRef.current = null
      setArrasto(null)
      aplicar(final)
    }

    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
  }

  const totais = times.map((t) => t.total)
  const diferenca = Math.max(...totais) - Math.min(...totais)

  return (
    <>
      <p className="info">
        Arraste pelo <span className="alca-exemplo">⋮⋮</span> para mudar alguém de time. Solte em
        cima de outro jogador para trocar os dois. Diferença entre os times: <strong>{diferenca}</strong>
      </p>

      {times.map((time, i) => {
        const ehAlvo = arrasto && arrasto.alvoTime === i && arrasto.origem !== i
        return (
          <section key={i} data-time={i} className={`card time ${ehAlvo ? 'alvo' : ''}`}>
            <h2>Time {i + 1}</h2>
            <p className="info">
              {time.jogadores.length} jogadores · {time.mulheres} mulher(es) · total {time.total} ·
              média {time.media}
            </p>
            <ul className="lista">
              {time.jogadores.map((j) => {
                const saindo = arrasto?.nome === j.nome
                const vaiTrocar = ehAlvo && arrasto.alvoJogador === j.nome
                return (
                  <li
                    key={j.nome}
                    data-jogador={j.nome}
                    className={`jogador-time ${saindo ? 'saindo' : ''} ${vaiTrocar ? 'troca' : ''}`}
                  >
                    <span
                      className="alca"
                      onPointerDown={(e) => iniciar(e, j.nome, i)}
                      aria-hidden="true"
                    >
                      ⋮⋮
                    </span>
                    <span className="nome">
                      {j.nome} ({j.nota})
                      {j.levantador && <span className="tag">L</span>}
                      {j.mulher && <span className="tag">{simboloMulher}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      {arrasto && (
        <div className="fantasma" style={{ left: arrasto.x, top: arrasto.y }}>
          {arrasto.nome}
        </div>
      )}
    </>
  )
}
