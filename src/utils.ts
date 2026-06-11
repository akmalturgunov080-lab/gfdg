/**
 * Fast custom Markdown and Code Syntax Highlighter for the AI Assistant.
 * Keeps response rendering lightweight and instant.
 */

export interface TokenPart {
  type: 'text' | 'keyword' | 'string' | 'comment' | 'function' | 'number' | 'operator';
  value: string;
}

// Simple rule-based syntax highlighter for Code Viewer
export function highlightCode(code: string, language: string = 'javascript'): TokenPart[][] {
  const lines = code.split('\n');
  
  // Basic keywords for common languages (JS, TS, Python, HTML, JSON)
  const keywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from',
    'class', 'default', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw', 'def', 'def',
    'import', 'as', 'from', 'public', 'private', 'interface', 'type', 'enum', 'string', 'number', 'boolean',
    'true', 'false', 'null', 'undefined'
  ]);

  return lines.map(line => {
    const tokens: TokenPart[] = [];
    let i = 0;
    
    // Check if line is a full-line comment
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      return [{ type: 'comment' as const, value: line }];
    }

    while (i < line.length) {
      const char = line[i];

      // Handle comments
      if (char === '/' && line[i + 1] === '/') {
        tokens.push({ type: 'comment', value: line.substring(i) });
        break;
      }

      // Handle strings
      if (char === '"' || char === "'" || char === '`') {
        const quote = char;
        let strVal = quote;
        i++;
        while (i < line.length && line[i] !== quote) {
          if (line[i] === '\\') {
            strVal += '\\' + (line[i + 1] || '');
            i += 2;
          } else {
            strVal += line[i];
            i++;
          }
        }
        if (i < line.length) {
          strVal += quote;
          i++;
        }
        tokens.push({ type: 'string', value: strVal });
        continue;
      }

      // Handle numbers
      if (/\d/.test(char)) {
        let numVal = '';
        while (i < line.length && /[\d.]/.test(line[i])) {
          numVal += line[i];
          i++;
        }
        tokens.push({ type: 'number', value: numVal });
        continue;
      }

      // Handle identifiers/keywords
      if (/[a-zA-Z_$]/.test(char)) {
        let idVal = '';
        while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
          idVal += line[i];
          i++;
        }
        
        if (keywords.has(idVal)) {
          tokens.push({ type: 'keyword', value: idVal });
        } else if (i < line.length && line[i] === '(') {
          tokens.push({ type: 'function', value: idVal });
        } else {
          tokens.push({ type: 'text', value: idVal });
        }
        continue;
      }

      // Handle operator sequences
      if (/[+\-*/%=<>!&|^~]/.test(char)) {
        let opVal = '';
        while (i < line.length && /[+\-*/%=<>!&|^~]/.test(line[i])) {
          opVal += line[i];
          i++;
        }
        tokens.push({ type: 'operator', value: opVal });
        continue;
      }

      // Standard character/whitespace
      tokens.push({ type: 'text', value: char });
      i++;
    }

    return tokens;
  });
}

export type ContentBlock = 
  | { type: 'text'; content: string }
  | { type: 'code'; content: string; language: string };

// Parse markdown to split plain text blocks and code blocks
export function parseMarkdownBlocks(text: string): ContentBlock[] {
  if (!text) return [];
  
  const blocks: ContentBlock[] = [];
  const regex = /```(\w*)\n([\s\S]*?)\n```/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // Add text preceding the code block if not empty
    if (matchIndex > lastIndex) {
      const txt = text.substring(lastIndex, matchIndex).trim();
      if (txt) {
        blocks.push({ type: 'text', content: txt });
      }
    }
    
    const language = match[1] || 'javascript';
    const content = match[2];
    blocks.push({ type: 'code', content, language });
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const txt = text.substring(lastIndex).trim();
    if (txt) {
      blocks.push({ type: 'text', content: txt });
    }
  }
  
  // If no block matched, return whole text as one text block
  if (blocks.length === 0) {
    return [{ type: 'text', content: text }];
  }
  
  return blocks;
}
