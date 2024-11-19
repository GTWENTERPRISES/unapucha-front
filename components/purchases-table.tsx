import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const purchases = [
  {
    id: "1",
    date: "2024-03-15",
    supplier: "TechCorp",
    total: "$5,299.99",
    status: "received",
    orderNumber: "PO-001",
  },
  {
    id: "2",
    date: "2024-03-14",
    supplier: "Electronics Inc",
    total: "$3,899.99",
    status: "pending",
    orderNumber: "PO-002",
  },
  {
    id: "3",
    date: "2024-03-13",
    supplier: "Global Supplies",
    total: "$2,599.99",
    status: "received",
    orderNumber: "PO-003",
  },
];

export function DataTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Orden #</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>{purchase.supplier}</TableCell>
              <TableCell>{purchase.total}</TableCell>
              <TableCell>
                <Badge
                  variant={purchase.status === "received" ? "success" : "warning"}
                >
                  {purchase.status === "received" ? "Recibido" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{purchase.orderNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}