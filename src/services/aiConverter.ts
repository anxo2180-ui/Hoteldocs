/**
 * AI-powered PDF-to-Wiki converter.
 * Uses OpenAI when key available, otherwise falls back to local heuristic converter.
 */

export interface ConversionStep {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
}

const OPENAI_PROMPT = `Eres un asistente especializado en convertir documentos de hoteles (manuales, procedimientos, políticas) a HTML limpio y semántico.

INSTRUCCIONES:
- Convierte el siguiente texto extraído de un PDF a HTML estructurado
- Usa <h1> solo para el título principal del documento
- Usa <h2> para secciones principales, <h3> para subsecciones
- Procedimientos paso a paso: listas ordenadas <ol>
- Listas de elementos: <ul>
- Términos importantes: <strong>
- Notas/advertencias: <blockquote> con clase "warning" o "note"
- Datos tabulares: <table> con <thead> y <tbody>
- NO omitas contenido, NO resumas
- Elimina headers/footers repetitivos y números de página
- Genera SOLO el HTML del contenido, sin <html> ni <body>
- HTML compatible con editor rich text

TEXTO DEL PDF:
{{pdf_text}}`

export async function convertPDFToWiki(text: string, openAIKey?: string): Promise<string> {
  if (!openAIKey) {
    return localPDFToWikiConverter(text)
  }
  const prompt = OPENAI_PROMPT.replace('{{pdf_text}}', text.slice(0, 12000))
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un experto en conversión de documentos a HTML semántico.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error('Error en la conversión de IA')
  const data = await res.json()
  const html = data.choices?.[0]?.message?.content ?? ''
  return cleanGeneratedHTML(html)
}

export async function convertPDFToWikiWithSteps(
  text: string,
  onStepChange: (steps: ConversionStep[]) => void,
  openAIKey?: string
): Promise<string> {
  const steps: ConversionStep[] = [
    { label: 'Extrayendo texto del PDF...', status: 'pending' },
    { label: 'Analizando estructura del documento...', status: 'pending' },
    { label: 'Generando contenido wiki...', status: 'pending' },
  ]

  const update = (index: number, status: ConversionStep['status']) => {
    steps[index] = { ...steps[index], status }
    onStepChange([...steps])
  }

  update(0, 'running')
  await wait(1200)
  update(0, 'done')

  update(1, 'running')
  await wait(1500)
  update(1, 'done')

  update(2, 'running')
  const html = openAIKey ? await convertPDFToWiki(text, openAIKey) : localPDFToWikiConverter(text)
  await wait(800)
  update(2, 'done')

  return html
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function localPDFToWikiConverter(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  const blocks: string[] = []
  let currentListType: 'ol' | 'ul' | null = null
  let currentListItems: string[] = []

  const flushList = () => {
    if (currentListItems.length === 0) return
    const tag = currentListType === 'ol' ? 'ol' : 'ul'
    const items = currentListItems.map((it) => `<li>${escapeHtml(it)}</li>`).join('\n')
    blocks.push(`<${tag}>\n${items}\n</${tag}>`)
    currentListItems = []
    currentListType = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1] ?? ''

    if (!line) {
      flushList()
      continue
    }

    // Detect title: very short, all caps or starts with numeric header pattern
    const isAllCaps = line === line.toUpperCase() && line.length > 3 && line.length < 80 && /[A-Z]/.test(line)
    const isNumericHeader = /^\d+[\.\)]?\s+[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(line) && line.length < 80
    if ((isAllCaps || isNumericHeader) && !currentListType && line.length < 80) {
      flushList()
      // If it's likely the first title and we have no h1 yet, make it h1
      const hasH1 = blocks.some((b) => b.startsWith('<h1>'))
      const tag = !hasH1 ? 'h1' : 'h2'
      blocks.push(`<${tag}>${escapeHtml(line.replace(/^\d+[\.\)]?\s*/, ''))}</${tag}>`)
      continue
    }

    // Detect sub-section: mixed case short line ending without period
    const isSubsection = line.length < 60 && !line.endsWith('.') && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñÑA-ZÁÉÍÓÚ\s]+$/.test(line)
    if (isSubsection && !currentListType) {
      flushList()
      blocks.push(`<h3>${escapeHtml(line)}</h3>`)
      continue
    }

    // Detect ordered list
    const olMatch = line.match(/^(\d+[\.\)])\s+(.+)$/)
    if (olMatch && olMatch[2].length > 2) {
      if (currentListType && currentListType !== 'ol') flushList()
      currentListType = 'ol'
      currentListItems.push(olMatch[2])
      continue
    }

    // Detect unordered list
    const ulMatch = line.match(/^[-•\*·]\s+(.+)$/)
    if (ulMatch && ulMatch[1].length > 2) {
      if (currentListType && currentListType !== 'ul') flushList()
      currentListType = 'ul'
      currentListItems.push(ulMatch[1])
      continue
    }

    // Detect note/warning
    const isNote = /^(Nota|NOTE|Importante|IMPORTANTE|Atención|ATENCIÓN)[\s:–-]/.test(line)
    const isWarning = /^(Advertencia|ADVERTENCIA|Warning|WARNING|Cuidado|CAUIDADO)[\s:–-]/.test(line)
    if (isNote || isWarning) {
      flushList()
      const cls = isWarning ? 'warning' : 'note'
      blocks.push(`<blockquote class="${cls}">${escapeHtml(line)}</blockquote>`)
      continue
    }

    // Detect table-like lines (multiple columns separated by 2+ spaces or tabs)
    if (/\S\s{2,}\S/.test(line) && !line.match(/^\d+[\.\)]/)) {
      // Simple heuristic: collect contiguous table-like lines
      const tableLines: string[] = [line]
      let j = i + 1
      while (j < lines.length && /\S\s{2,}\S/.test(lines[j]) && lines[j].trim()) {
        tableLines.push(lines[j])
        j++
      }
      if (tableLines.length >= 2) {
        flushList()
        const rows = tableLines.map((l) =>
          l.split(/\s{2,}/).map((c) => `<td>${escapeHtml(c.trim())}</td>`).join('')
        )
        const thead = `<thead><tr>${rows[0]}</tr></thead>`
        const tbody = `<tbody>${rows.slice(1).map((r) => `<tr>${r}</tr>`).join('')}</tbody>`
        blocks.push(`<table>\n${thead}\n${tbody}\n</table>`)
        i = j - 1
        continue
      }
    }

    // Paragraph (default)
    flushList()
    // If this line and next are short, they might be a header we missed
    if (line.length < 50 && nextLine.length < 50 && !nextLine && !line.endsWith('.')) {
      blocks.push(`<h3>${escapeHtml(line)}</h3>`)
    } else {
      // Bold important terms inside paragraph
      let escaped = escapeHtml(line)
      escaped = escaped.replace(/\b([A-ZÁÉÍÓÚÑ]{3,}(\s+[A-ZÁÉÍÓÚÑ]+)*)\b/g, '<strong>$1</strong>')
      blocks.push(`<p>${escaped}</p>`)
    }
  }

  flushList()

  let html = blocks.join('\n\n')
  html = cleanGeneratedHTML(html)
  return html
}

function cleanGeneratedHTML(raw: string): string {
  let html = raw
    .replace(/```html?/g, '')
    .replace(/```/g, '')
    .replace(/<html[^>]*>|<\/html>/gi, '')
    .replace(/<body[^>]*>|<\/body>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .trim()
  // Remove empty tags
  html = html.replace(/<(p|h1|h2|h3|li|td|th|blockquote)[^>]*>\s*<\/\1>/gi, '')
  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
