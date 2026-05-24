import { Badge } from "@/components/ui/badge";

interface InventoryBadgeProps {
  availableStock: number;
}

export function InventoryBadge({ availableStock }: InventoryBadgeProps) {
  if (availableStock <= 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  if (availableStock <= 2) {
    return <Badge variant="warning">Only {availableStock} left</Badge>;
  }

  if (availableStock <= 6) {
    return <Badge variant="accent">Moving fast</Badge>;
  }

  return <Badge variant="success">{availableStock} ready to reserve</Badge>;
}
