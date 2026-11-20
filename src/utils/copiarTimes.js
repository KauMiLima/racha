// Monta o texto dos times no formato do WhatsApp (*negrito*)
export function textoDosTimes(times) {
  const blocos = times.map((time, i) => {
    const nomes = time.jogadores
      .map((j, n) => `${n + 1}. ${j.nome}${j.levantador ? ' (L)' : ''}`)
      .join('\n')
    return `*Time ${i + 1}*\n${nomes}`
  })
  return `🏐 *TIMES*\n\n${blocos.join('\n\n')}`
}

// Copia um texto para a área de transferência.
// navigator.clipboard só funciona em https ou localhost; pelo IP da rede
// (http://192.168...) o celular bloqueia, então usamos um plano B.
export async function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      // segue para o plano B
    }
  }

  const campo = document.createElement('textarea')
  campo.value = texto
  campo.setAttribute('readonly', '')
  campo.style.position = 'fixed'
  campo.style.top = '0'
  campo.style.opacity = '0'
  campo.style.fontSize = '16px' // evita zoom no iPhone
  document.body.appendChild(campo)
  campo.focus()
  campo.select()
  campo.setSelectionRange(0, texto.length) // necessário no iPhone

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(campo)
  return ok
}
