import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  info: string;
  page?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function AdminPagination({
  info,
  page = 1,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
}: AdminPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
      <span>{info}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
          Trước
        </Button>
        <Button variant="outline" size="sm">
          {page}
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
          Sau
        </Button>
      </div>
    </div>
  );
}
