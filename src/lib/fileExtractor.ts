import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(
  buffer: Buffer, 
  fileType: string
): Promise<string> {
  try {
    if (fileType === 'pdf') {
      // PDF extraction with error handling
      try {
        const data = await pdfParse(buffer, {
          max: 0, // Parse all pages
          version: 'v1.10.100'
        });
        
        if (!data.text || data.text.trim().length === 0) {
          throw new Error('No text content in PDF');
        }
        
        return data.text;
      } catch (pdfError) {
        // Fallback: try to extract from binary
        const text = buffer.toString('latin1');
        const readable = text
          .split(/[^\w\s@\.\-+]/)
          .filter(part => part.length > 3)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (readable.length > 100) {
          return readable;
        }
        
        throw new Error('Unable to extract text from PDF');
      }
    } 
    else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content in DOCX');
      }
      
      return result.value;
    } 
    else if (fileType === 'txt') {
      const text = buffer.toString('utf-8');
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text file');
      }
      
      return text;
    }
    
    throw new Error(`Unsupported file type: ${fileType}`);
    
  } catch (error: any) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}