import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

/** Renders the small Markdown subset used by the owner-written content files: headings, bullets and paragraphs. */
export const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={blocks.length} className="mb-3 list-disc space-y-1 pl-5 text-base text-mainText">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
  };

  text.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    const heading = line.match(/^#{2,4}\s+(.*)$/);
    if (line.startsWith('- ')) {
      bullets.push(line.slice(2));
      return;
    }
    flush();
    if (heading) {
      blocks.push(
        <h3 key={blocks.length} className="mb-2 mt-4 text-lg font-semibold text-mainText">
          {heading[1]}
        </h3>,
      );
    } else if (line.length > 0) {
      blocks.push(
        <p key={blocks.length} className="mb-3 text-base text-mainText">
          {renderInline(line)}
        </p>,
      );
    }
  });
  flush();
  return <>{blocks}</>;
};
