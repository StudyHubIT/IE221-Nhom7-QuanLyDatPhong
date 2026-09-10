"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RoomPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

export function RoomPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: RoomPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
      <p className="text-xs text-muted-foreground font-medium">
        Hiển thị <span className="font-bold text-foreground">{startItem} - {endItem}</span> trên tổng số <span className="font-bold text-primary">{totalItems}</span> phòng khả dụng
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous Page */}
        <Button
          asChild={currentPage > 1}
          disabled={currentPage <= 1}
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-3 text-xs font-semibold"
        >
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} scroll={false}>
              <ChevronLeft className="mr-1 size-3.5" />
            </Link>
          ) : (
            <span>
              <ChevronLeft className="mr-1 size-3.5" />
            </span>
          )}
        </Button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            asChild={page !== currentPage}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className={cn(
              "size-9 rounded-xl text-xs font-extrabold transition-all",
              page === currentPage
                ? "shadow-sm shadow-primary/20"
                : "border-border/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {page !== currentPage ? (
              <Link href={createPageUrl(page)} scroll={false}>
                {page}
              </Link>
            ) : (
              <span>{page}</span>
            )}
          </Button>
        ))}

        {/* Next Page */}
        <Button
          asChild={currentPage < totalPages}
          disabled={currentPage >= totalPages}
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-3 text-xs font-semibold"
        >
          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)} scroll={false}>
              <ChevronRight className="ml-1 size-3.5" />
            </Link>
          ) : (
            <span>
              <ChevronRight className="ml-1 size-3.5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
