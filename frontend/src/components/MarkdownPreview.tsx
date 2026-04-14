import type { ReactNode } from 'react';

type MarkdownPreviewProps = {
  content: string;
  emptyLabel?: string;
};

type InlineToken = {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link';
  value: string;
  href?: string;
};

function isSafeHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:');
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const value = match[0];
    if (value.startsWith('**')) {
      tokens.push({ type: 'bold', value: value.slice(2, -2) });
    } else if (value.startsWith('`')) {
      tokens.push({ type: 'code', value: value.slice(1, -1) });
    } else if (value.startsWith('[')) {
      const linkMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch?.[1] && linkMatch[2] && isSafeHref(linkMatch[2])) {
        tokens.push({ type: 'link', value: linkMatch[1], href: linkMatch[2] });
      } else {
        tokens.push({ type: 'text', value });
      }
    } else {
      tokens.push({ type: 'italic', value: value.slice(1, -1) });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

function renderInline(text: string): ReactNode[] {
  return parseInline(text).map((token, index) => {
    const key = `${token.type}-${index}`;
    if (token.type === 'bold') {
      return <strong key={key}>{token.value}</strong>;
    }

    if (token.type === 'italic') {
      return <em key={key}>{token.value}</em>;
    }

    if (token.type === 'code') {
      return <code key={key}>{token.value}</code>;
    }

    if (token.type === 'link') {
      return (
        <a key={key} href={token.href} rel="noreferrer" target="_blank">
          {token.value}
        </a>
      );
    }

    return token.value;
  });
}

function isBlockStart(line: string) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^```/.test(line)
  );
}

function renderBlocks(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[index] ?? '');
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre key={`code-${index}`}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading?.[1] && heading[2]) {
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      if (level === 1) {
        blocks.push(<h1 key={`h1-${index}`}>{content}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 key={`h2-${index}`}>{content}</h2>);
      } else {
        blocks.push(<h3 key={`h3-${index}`}>{content}</h3>);
      }
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test((lines[index] ?? '').trim())) {
        items.push((lines[index] ?? '').trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }

      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test((lines[index] ?? '').trim())) {
        items.push((lines[index] ?? '').trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }

      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test((lines[index] ?? '').trim())) {
        quoteLines.push((lines[index] ?? '').trim().replace(/^>\s?/, ''));
        index += 1;
      }

      blocks.push(<blockquote key={`quote-${index}`}>{renderInline(quoteLines.join(' '))}</blockquote>);
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length && (lines[index] ?? '').trim() && !isBlockStart((lines[index] ?? '').trim())) {
      paragraphLines.push((lines[index] ?? '').trim());
      index += 1;
    }

    blocks.push(<p key={`p-${index}`}>{renderInline(paragraphLines.join(' '))}</p>);
  }

  return blocks;
}

export function MarkdownPreview({
  content,
  emptyLabel = 'Aucune description Markdown pour le moment.',
}: MarkdownPreviewProps) {
  if (!content.trim()) {
    return <p className="text-sm text-base-content/60">{emptyLabel}</p>;
  }

  return <div className="pdf-prose max-w-none">{renderBlocks(content)}</div>;
}
