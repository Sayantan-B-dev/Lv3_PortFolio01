interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <p className="section-heading__eyebrow">
        {eyebrow}
      </p>
      <h2 className="section-heading__title">
        {title}
      </h2>
      {description ? (
        <p className="section-heading__desc">
          {description}
        </p>
      ) : null}
    </div>
  );
}
