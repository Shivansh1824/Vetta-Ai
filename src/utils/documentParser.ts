/**
 * Document Parser Utility — Vetta AI
 * Parses multi-format documents (DOCX, DOC, TXT, MD) into clean text strings
 * using standard browser APIs without external heavy dependencies.
 */

export interface ParsedDocument {
  text: string
  isBinaryDocument: boolean
  isPdfOrImage: boolean
  format: 'pdf' | 'image' | 'docx' | 'doc' | 'text'
}

/**
 * Extracts plain text from DOCX (ZIP archive containing word/document.xml)
 */
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const bytes = new Uint8Array(buffer)
    const view = new DataView(buffer)
    let offset = 0

    while (offset < bytes.length - 30) {
      // ZIP local file header signature 0x04034b50 (PK\x03\x04)
      if (view.getUint32(offset, true) === 0x04034b50) {
        const compMethod = view.getUint16(offset + 8, true)
        const compSize = view.getUint32(offset + 18, true)
        const nameLen = view.getUint16(offset + 26, true)
        const extraLen = view.getUint16(offset + 28, true)
        const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen)
        const name = new TextDecoder().decode(nameBytes)
        const dataStart = offset + 30 + nameLen + extraLen

        if (name === 'word/document.xml') {
          const compData = bytes.slice(dataStart, dataStart + compSize)
          let xml = ''

          if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw')
            const writer = ds.writable.getWriter()
            writer.write(compData)
            writer.close()
            const resp = new Response(ds.readable)
            xml = await resp.text()
          } else {
            xml = new TextDecoder('utf-8', { fatal: false }).decode(compData)
          }

          return xml
            .replace(/<w:p[^>]*>/g, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/\n\s*\n+/g, '\n\n')
            .trim()
        }
        offset = dataStart + compSize
      } else {
        offset++
      }
    }
  } catch (err) {
    console.warn('DOCX XML decompression failed, using fallback string scanner:', err)
  }
  return ''
}

/**
 * Extracts printable ASCII/Unicode runs from legacy binary DOC or corrupted files
 */
function extractDocBinaryText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let text = ''
  let currentRun = ''

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      currentRun += String.fromCharCode(b)
    } else {
      if (currentRun.length >= 4) {
        text += currentRun + ' '
      }
      currentRun = ''
    }
  }
  if (currentRun.length >= 4) text += currentRun
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Main parser entry point: parses any uploaded File into clean text or flags for base64 OCR
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
  const isPdf = ext === 'pdf'
  const isDocx = ext === 'docx'
  const isDoc = ext === 'doc'

  if (isPdf) {
    return { text: '', isBinaryDocument: true, isPdfOrImage: true, format: 'pdf' }
  }

  if (isImg) {
    return { text: '', isBinaryDocument: true, isPdfOrImage: true, format: 'image' }
  }

  if (isDocx) {
    const buffer = await file.arrayBuffer()
    let text = await extractDocxText(buffer)
    if (!text || text.length < 20) {
      text = extractDocBinaryText(buffer)
    }
    return { text, isBinaryDocument: true, isPdfOrImage: false, format: 'docx' }
  }

  if (isDoc) {
    const buffer = await file.arrayBuffer()
    const text = extractDocBinaryText(buffer)
    return { text, isBinaryDocument: true, isPdfOrImage: false, format: 'doc' }
  }

  // Plain text formats (.txt, .md, etc.)
  const text = await file.text()
  return { text, isBinaryDocument: false, isPdfOrImage: false, format: 'text' }
}
