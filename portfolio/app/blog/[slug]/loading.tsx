import { Atom } from "react-loading-indicators";

export default function BlogPostLoading() {
  return (
    <main className="page-main page-main--padded">
      <div className="container-x loader-fallback" role="status" aria-label="Loading post">
        <div className="loader-fallback__inner">
          <Atom color="#c4b5fd" size="medium" text="" textColor="" />
          <p className="route-loader__text">Loading post…</p>
        </div>
      </div>
    </main>
  );
}
