import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <h2 id="empty-state-title" className="type-title">
        {title}
      </h2>
      {description ? <p className="type-md">{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}
