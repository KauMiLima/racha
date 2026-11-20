// Marcações que precisam ser espalhadas por igual entre os times.
// A ordem define a prioridade na distribuição (as mais raras primeiro).
const CATEGORIAS = ['levantador', 'mulher']

const soma = (time) => time.reduce((total, j) => total + j.nota, 0)
const contar = (time, campo) => time.filter((j) => j[campo]).length

// Quanto os times estão desequilibrados (0 = perfeito)
function desequilibrio(times) {
  const somas = times.map(soma)
  const media = somas.reduce((a, b) => a + b, 0) / somas.length
  return somas.reduce((total, s) => total + (s - media) ** 2, 0)
}

// Nenhuma dupla "separados" no mesmo time
function respeitaSeparados(time, separados) {
  const nomes = new Set(time.map((j) => j.nome))
  return !separados.some(([a, b]) => nomes.has(a) && nomes.has(b))
}

// Time dentro das regras: separados + quantidade certa de cada categoria
function timeValido(time, ctx) {
  return (
    respeitaSeparados(time, ctx.separados) &&
    ctx.limites.every(({ campo, min, max }) => {
      const n = contar(time, campo)
      return n >= min && n <= max
    })
  )
}

// Junta quem quer jogar junto em blocos
function montarGrupos(jogadores, juntos) {
  const grupoDe = new Map(jogadores.map((j) => [j.nome, [j]]))
  for (const [a, b] of juntos) {
    const ga = grupoDe.get(a)
    const gb = grupoDe.get(b)
    if (!ga || !gb || ga === gb) continue
    ga.push(...gb)
    for (const j of gb) grupoDe.set(j.nome, ga)
  }
  return [...new Set(grupoDe.values())]
}

// Ordena do mais forte pro mais fraco, com um pouco de aleatoriedade
function ordenarPorForca(grupos) {
  return grupos
    .map((g) => ({ g, peso: soma(g) + Math.random() * 0.5 }))
    .sort((a, b) => b.peso - a.peso)
    .map(({ g }) => g)
}

// Grupo com levantador → 0, com mulher → 1, sem marcação → 2
function prioridade(grupo) {
  const i = CATEGORIAS.findIndex((campo) => contar(grupo, campo) > 0)
  return i === -1 ? CATEGORIAS.length : i
}

// Distribuição inicial: categorias primeiro (espalhadas), depois o resto
function distribuir(grupos, numTimes, tamanhoMax, ctx) {
  const times = Array.from({ length: numTimes }, () => [])
  const ordenados = ordenarPorForca(grupos).sort((a, b) => prioridade(a) - prioridade(b))

  for (const grupo of ordenados) {
    const opcoes = times
      .filter((t) => t.length + grupo.length <= tamanhoMax)
      .filter((t) =>
        ctx.limites.every(({ campo, max }) => contar(t, campo) + contar(grupo, campo) <= max)
      )
      .filter((t) => respeitaSeparados([...t, ...grupo], ctx.separados))
      .sort((a, b) => {
        // Prefere o time com menos gente da mesma categoria do grupo
        for (const campo of CATEGORIAS) {
          if (contar(grupo, campo) > 0) {
            const dif = contar(a, campo) - contar(b, campo)
            if (dif !== 0) return dif
          }
        }
        return a.length - b.length || soma(a) - soma(b)
      })

    const destino =
      opcoes[0] ?? times.reduce((menor, t) => (t.length < menor.length ? t : menor))
    destino.push(...grupo)
  }
  return times
}

// Testa trocas 1 por 1 entre times e mantém as que melhoram o equilíbrio
function melhorarComTrocas(times, fixos, ctx) {
  let melhorou = true
  while (melhorou) {
    melhorou = false
    for (let a = 0; a < times.length; a++) {
      for (let b = a + 1; b < times.length; b++) {
        for (let i = 0; i < times[a].length; i++) {
          for (let k = 0; k < times[b].length; k++) {
            const ja = times[a][i]
            const jb = times[b][k]
            if (fixos.has(ja.nome) || fixos.has(jb.nome) || ja.nota === jb.nota) continue

            const antes = desequilibrio(times)
            times[a][i] = jb
            times[b][k] = ja

            const valida = timeValido(times[a], ctx) && timeValido(times[b], ctx)

            if (valida && desequilibrio(times) < antes) {
              melhorou = true
            } else {
              times[a][i] = ja // desfaz a troca
              times[b][k] = jb
            }
          }
        }
      }
    }
  }
  return times
}

export function balancearTimes(jogadores, numTimes = 2, regras = {}, tentativas = 100) {
  const { juntos = [], separados = [] } = regras

  const ctx = {
    separados,
    limites: CATEGORIAS.map((campo) => {
      const total = contar(jogadores, campo)
      return { campo, min: Math.floor(total / numTimes), max: Math.ceil(total / numTimes) }
    }),
  }

  const grupos = montarGrupos(jogadores, juntos)
  const fixos = new Set(grupos.filter((g) => g.length > 1).flat().map((j) => j.nome))
  const tamanhoMax = Math.ceil(jogadores.length / numTimes)

  // Soluções que quebram alguma regra ficam com nota péssima
  const pontuar = (times) =>
    desequilibrio(times) + (times.every((t) => timeValido(t, ctx)) ? 0 : 1e6)

  let melhor = null
  for (let t = 0; t < tentativas; t++) {
    const times = melhorarComTrocas(distribuir(grupos, numTimes, tamanhoMax, ctx), fixos, ctx)
    if (!melhor || pontuar(times) < pontuar(melhor)) melhor = times
  }

  return melhor.map(resumirTime)
}

// Recalcula os números de um time (usado também quando você arrasta jogadores)
export function resumirTime(jogadores) {
  return {
    jogadores,
    total: soma(jogadores),
    media: jogadores.length ? +(soma(jogadores) / jogadores.length).toFixed(1) : 0,
    levantadores: contar(jogadores, 'levantador'),
    mulheres: contar(jogadores, 'mulher'),
  }
}
