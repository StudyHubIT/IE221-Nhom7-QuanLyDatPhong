import { Button } from "@/components/ui/button";

export function AdminPagination({ info }: { info: string }) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
      <span>{info}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled>
          Trước
        </Button>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="outline" size="sm" disabled>
          Sau
        </Button>
      </div>
    </div>
  );
}
