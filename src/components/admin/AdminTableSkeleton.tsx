"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminTableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Shared loading skeleton for admin data tables.
 */
export function AdminTableSkeleton({
  rows = 5,
  columns = 4,
}: AdminTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-slate-50">
          <TableCell colSpan={columns} className="px-6 py-6 md:px-12 md:py-8">
            <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
