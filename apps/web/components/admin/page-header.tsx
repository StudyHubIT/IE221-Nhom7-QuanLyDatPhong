import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminPageHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
};

export function AdminPageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actionLabel && actionHref ? (
        <Button asChild>
          <Link href={actionHref}>
            <Plus />
            {actionLabel}
          </Link>
        </Button>
      ) : actionLabel ? (
        <Button>
          <Plus />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
