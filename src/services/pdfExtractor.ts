import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Extracts text from a PDF file using pdfjs-dist (Mozilla PDF.js).
 * Works in the browser via Vite bundling.
 *
 * @param file - PDF File object
 * @returns Promise<string> with the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise

    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item) => {
          // Each item in textContent.items has a `str` property
          if (typeof item === 'object' && item !== null && 'str' in item) {
            return (item as { str: string }).str
          }
          return ''
        })
        .join(' ')

      fullText += pageText + '\n\n'
      page.cleanup()
    }

    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    return ''
  }
}
