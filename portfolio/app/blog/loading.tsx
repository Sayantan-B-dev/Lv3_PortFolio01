import { Atom } from "react-loading-indicators";

export default function BlogLoading() {
  return (
    <main className="page-main page-main--padded">
      <div className="container-x" role="status" aria-label="Loading blog">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">06</span>
          <span className="eyebrow-row__center">Blog</span>
          <span className="eyebrow-row__right">Notes &amp; builds</span>
        </div>
        <div className="loader-fallback" style={{ minHeight: "18vh", padding: "24px 0" }}>
          <div className="loader-fallback__inner">
            <Atom color="#c4b5fd" size="medium" text="" textColor="" />
            <p className="route-loader__text">Loading posts…</p>
          </div>
        </div>
        <div className="blog-skeleton-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="blog-skeleton-card">
              <div className="blog-skeleton-card__img" />
              <div className="blog-skeleton-card__body">
                <div className="blog-skeleton-line blog-skeleton-line--short" />
                <div className="blog-skeleton-line" />
                <div className="blog-skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
