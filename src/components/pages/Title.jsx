import "../styles/title.css";

function Title({
  label,
  title,
  highlight,
  description,
  align = "left",
  className = "",
  as: Heading = "h2",
}) {
  return (
    <header
      className={`section-title section-title--${align} ${className}`}
    >
      {label && (
        <span className="section-title__label">
          {label}
        </span>
      )}

      <Heading className="section-title__heading">
        {title}
        {highlight && (
          <>
            {" "}
            <span>{highlight}</span>
          </>
        )}
      </Heading>

      {description && (
        <p className="section-title__description">
          {description}
        </p>
      )}
    </header>
  );
}

export default Title;