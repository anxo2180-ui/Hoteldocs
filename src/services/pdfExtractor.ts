/**
 * PDF text extraction service.
 * Attempts to use pdf-parse (Node.js), falls back to FileReader for browser.
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Try pdf-parse first (Node.js only, will fail in browser and fall back)
    const pdfParse = await import('pdf-parse')
    const arrayBuffer = await file.arrayBuffer()
    // @ts-ignore - Buffer is Node.js only, falls back in browser
    const buffer = typeof Buffer !== 'undefined' ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer)
    // @ts-ignore - ESM/CJS interop
    const data = await (pdfParse.default || pdfParse)(buffer)
    return data.text
  } catch {
    // Browser fallback: read as text/plain and clean up
    return fallbackExtractText(file)
  }
}

async function fallbackExtractText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      let text = String(reader.result || '')
      // PDF binary contains text interspersed with control chars
      // Remove null bytes and common PDF binary noise
      text = text
        .replace(/\0/g, '')
        .replace(/stream\r?\n[\s\S]*?endstream/g, '')
        .replace(/obj\s*<<[\s\S]*?>>\s*endobj/g, '')
        .replace(/\/[A-Za-z0-9]+\s*<<[\s\S]*?>>/g, '')
        .replace(/\/[A-Za-z0-9]+\s*\d+\s*\d+\s*R/g, '')
        .replace(/\b(Tj|TJ|Td|TD|Tm|T\*|ET|BT|BDC|BMC|EMC|Do|sh|f|F|f\*|S|s|n|W|W\*|b|B|b\*|re|c|l|m|h|v|y|q|Q|gs|CS|cs|SC|SCN|sc|scn|G|g|RG|rg|K|k|d0|d1|BI|ID|EI|MP|DP|BX|EX)\b/g, '')
        .replace(/\(\d+\)/g, '')
        .replace(/\[\s*\d+(\s+\d+)*\s*\]/g, '')
        .replace(/\b xref\b|\b trailer\b|\b startxref\b|\b %%EOF\b/gi, '')
      // Extract anything that looks like readable text (sequences of printable chars)
      const readableChars: string[] = []
      let currentWord = ''
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const code = char.charCodeAt(0)
        if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
          currentWord += char
        } else {
          if (currentWord.length > 2) {
            readableChars.push(currentWord)
          }
          currentWord = ''
        }
      }
      if (currentWord.length > 2) readableChars.push(currentWord)
      let result = readableChars.join(' ')
      // Clean repeated whitespace
      result = result
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim()
      resolve(result)
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo PDF'))
    reader.readAsBinaryString(file)
  })
}
