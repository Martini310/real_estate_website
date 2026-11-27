import { formatDescription, type DescriptionBlock, type DescriptionItem } from "@/lib/description";

/** Odstęp nad blokiem zależy od tego, co stoi nad nim — śródtytuł „przykleja się” do swojej treści. */
function spacing(block: DescriptionBlock, prev: DescriptionBlock | undefined) {
  if (!prev) return "";
  if (prev.type === "heading") return prev.level === 4 && block.type !== "heading" ? "mt-2" : "mt-3";
  if (block.type === "heading") return block.level === 3 ? "mt-10" : "mt-7";
  return "mt-4";
}

function ItemText({ item }: { item: DescriptionItem }) {
  if (!item.label) return <>{item.text}</>;
  return (
    <>
      <span className="text-text-primary">{item.label}:</span> {item.text}
    </>
  );
}

function Block({ block, className }: { block: DescriptionBlock; className: string }) {
  switch (block.type) {
    case "lead":
      return <p className={`${className} text-lg font-light leading-relaxed text-text-primary`}>{block.text}</p>;

    case "heading": {
      const meta = block.meta && <span className="ml-2 font-normal text-text-secondary">{block.meta}</span>;
      return block.level === 3 ? (
        <h3 className={`${className} text-body font-medium text-text-primary`}>
          {block.text}
          {meta}
        </h3>
      ) : (
        <h4 className={`${className} text-small font-medium text-text-primary`}>
          {block.text}
          {meta}
        </h4>
      );
    }

    case "paragraph":
      return <p className={`${className} text-body text-text-secondary`}>{block.text}</p>;

    case "list":
      return (
        <ul className={`${className} space-y-2`}>
          {block.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-body text-text-secondary">
              {/* Ten sam znacznik co w „Najważniejszych cechach” */}
              <span aria-hidden="true" className="mt-[0.7rem] h-1 w-1 flex-shrink-0 rounded-full bg-beige" />
              <span>
                <ItemText item={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "facts":
      return (
        <dl className={`${className} divide-y divide-line border-y border-line`}>
          {block.items.map((item, idx) =>
            item.label ? (
              <div key={idx} className="flex items-baseline justify-between gap-6 py-2.5 text-small">
                <dt className="text-text-secondary">{item.label}</dt>
                <dd className="text-right text-text-primary">{item.text}</dd>
              </div>
            ) : (
              // Pozycja bez etykiety („Brak podatku PCC (0%)”) — cały wiersz; pusty dd, bo dl wymaga pary
              <div key={idx} className="py-2.5 text-small">
                <dt className="text-text-primary">{item.text}</dt>
                <dd />
              </div>
            ),
          )}
        </dl>
      );
  }
}

/**
 * Opis oferty z portalu, ułożony w śródtytuły, listy i tabelki
 * (reguły w `lib/description.ts` — treść bez zmian).
 */
export default function PropertyDescription({ text }: { text: string }) {
  const { blocks, disclaimer } = formatDescription(text);

  return (
    <div className="max-w-prose">
      {blocks.map((block, idx) => (
        <Block key={idx} block={block} className={spacing(block, blocks[idx - 1])} />
      ))}
      {disclaimer && <p className="mt-10 text-xs leading-relaxed text-text-secondary/60">{disclaimer}</p>}
    </div>
  );
}
