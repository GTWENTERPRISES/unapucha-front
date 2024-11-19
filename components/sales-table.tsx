"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Tipos
type Sale = {
  id: string;
  fecha: string;
  cliente_nombre: string;
  total: string;
  estado: string;
  metodo_pago: string;
  detalles?: string;
};

type SaleDetail = {
  id: string;
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export function DataTable() {
  // Estados
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [detailsSale, setDetailsSale] = useState<Sale | null>(null);
  const [deleteSaleId, setDeleteSaleId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([]);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [newSale, setNewSale] = useState<Sale>({
    id: '',
    fecha: '',
    cliente_nombre: '',
    total: '',
    estado: 'pendiente',
    metodo_pago: 'efectivo',
    detalles: '',
  });

  // Fetch Sales
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/ventas/");
        if (!response.ok) throw new Error("Error al cargar los datos");
        const data = await response.json();
        setSales(data);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Cargar detalles de venta
  const handleViewDetails = async (sale: Sale) => {
    try {
      const detailsResponse = await fetch(`http://localhost:8000/api/detalle-ventas/${sale.id}/`);
      
      if (!detailsResponse.ok) {
        throw new Error("Error al cargar los detalles de la venta");
      }
      
      const details = await detailsResponse.json();
      
      setSaleDetails(details);
      setDetailsSale(sale);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles de venta:", error);
      alert("No se pudieron cargar los detalles de la venta");
    }
  };

  // Editar venta
  const handleEdit = (sale: Sale) => setEditSale(sale);

  // Actualizar venta
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSale) return;

    const venta = {
      cliente_nombre: editSale.cliente_nombre,
      metodo_pago: editSale.metodo_pago,
      detalles: editSale.detalles,
    };

    try {
      const response = await fetch(
        `http://localhost:8000/api/ventas/${editSale.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(venta),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar el registro");

      const updatedSale = await response.json();
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale.id === updatedSale.id ? updatedSale : sale
        )
      );

      setEditSale(null);
    } catch (error) {
      alert("Error al actualizar la venta");
    }
  };

  // Eliminar venta
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ventas/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el registro");
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== id));
    } catch (error) {
      alert("Error al eliminar la venta");
    } finally {
      setDeleteSaleId(null);
    }
  };

  // Agregar venta
  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const venta = {
      fecha: newSale.fecha,
      cliente_nombre: newSale.cliente_nombre,
      total: newSale.total,
      estado: newSale.estado,
      metodo_pago: newSale.metodo_pago,
      detalles: newSale.detalles,
    };

    try {
      const response = await fetch("http://localhost:8000/api/ventas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta),
      });
      if (!response.ok) throw new Error("Error al crear la venta");

      const addedSale = await response.json();
      setSales((prevSales) => [...prevSales, addedSale]);
      setIsAddSaleOpen(false);
      setNewSale({
        id: '',
        fecha: '',
        cliente_nombre: '',
        total: '',
        estado: 'pendiente',
        metodo_pago: 'efectivo',
        detalles: '',
      });
    } catch (error) {
      alert("Error al agregar la venta");
    }
  };

  // Estado de carga y error
  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar los datos.</div>;

  return (
    <div className="rounded-md border p-4">
      <Button 
        variant="outline" 
        onClick={() => setIsAddSaleOpen(true)} 
        className="mb-4"
      >
        Agregar Venta
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.fecha}</TableCell>
              <TableCell>{sale.cliente_nombre}</TableCell>
              <TableCell>${sale.total}</TableCell>
              <TableCell>
                <Badge
                  variant={sale.estado === "completado" ? "success" : "warning"}
                >
                  {sale.estado === "completado" ? "Completado" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{sale.metodo_pago}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm "
                    onClick={() => handleViewDetails(sale)}
                  >
                    Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sale)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteSaleId(sale.id)}
                    className="ml-2"
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de Detalles */}
      <Dialog open={isDetailsOpen} onOpenChange={() => setIsDetailsOpen(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Venta</DialogTitle>
            <DialogDescription>
              Información completa de la venta
            </DialogDescription>
          </DialogHeader>
          
          {detailsSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>Cliente:</strong> {detailsSale.cliente_nombre}
                </div>
                <div>
                  <strong>Fecha:</strong> {detailsSale.fecha}
                </div>
                <div>
                  <strong>Total:</strong> ${detailsSale.total}
                </div>
                <div>
                  <strong>Método de Pago:</strong> {detailsSale.metodo_pago}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.producto}</TableCell>
                      <TableCell>{detail.cantidad}</TableCell>
                      <TableCell>${detail.precio.toFixed(2)}</TableCell>
                      <TableCell>${detail.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar */}
      <Dialog open={!!editSale} onOpenChange={() => setEditSale(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Venta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la venta seleccionada.
            </DialogDescription>
          </DialogHeader>
          {editSale && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Cliente</label>
                <input
                  type="text"
                  className="input w-full"
                  value={editSale.cliente_nombre || ""}
                  onChange={(e) => setEditSale({ ...editSale, cliente_nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Método de Pago</label>
                <select
                  className="input w-full"
                  value={editSale.metodo_pago || "efectivo"}
                  onChange={(e) => setEditSale({ ...editSale, metodo_pago: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Detalles</label>
                <textarea
                  className="input w-full"
                  value={editSale.detalles || ""}
                  onChange={(e) => setEditSale({ ...editSale, detalles: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Actualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para agregar venta */}
      <Dialog open={isAddSaleOpen} onOpenChange={() => setIsAddSaleOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Venta</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva venta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSale} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="date"
                className="input w-full"
                value={newSale.fecha}
                onChange={(e) => setNewSale({ ...newSale, fecha: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Cliente</label>
              <input
                type="text"
                className="input w-full"
                value={newSale.cliente_nombre}
                onChange={(e) => setNewSale({ ...newSale, cliente_nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Total</label>
              <input
                type="number"
                className="input w-full"
                value={newSale.total}
                onChange={(e) => setNewSale({ ...newSale, total: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Método de Pago</label>
              <select
                className="input w-full"
                value={newSale.metodo_pago}
                onChange={(e) => setNewSale({ ...newSale, metodo_pago: e.target.value })}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Detalles</label>
              <textarea
                className="input w-full"
                value={newSale.detalles}
                onChange={(e) => setNewSale({ ...newSale, detalles: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Agregar Venta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}