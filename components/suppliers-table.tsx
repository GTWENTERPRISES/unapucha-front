import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Supplier {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ruc: string;
}

export function DataTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ruc: ''
  });

  // Fetch Suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/proveedores/');
        setSuppliers(response.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Handlers
  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setOpenEdit(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/proveedores/${id}/`);
      setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleSave = async () => {
    try {
      if (currentSupplier.id) {
        // Actualizar proveedor existente
        const response = await axios.put(`http://localhost:8000/api/proveedores/${currentSupplier.id}/`, currentSupplier);
        setSuppliers(suppliers.map((s) => (s.id === currentSupplier.id ? response.data : s)));
        setOpenEdit(false);
      } else {
        // Agregar nuevo proveedor
        const response = await axios.post('http://localhost:8000/api/proveedores/', currentSupplier);
        setSuppliers([...suppliers, response.data]);
        setOpenAdd(false);
      }
      // Resetear el proveedor actual
      setCurrentSupplier({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ruc: ''
      });
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Render loading or error states
  if (loading) {
    return <div className="text-center py-4">Cargando proveedores...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
       
        <Button 
          onClick={() => {
            setCurrentSupplier({
              nombre: '',
              email: '',
              telefono: '',
              direccion: '',
              ruc: ''
            });
            setOpenAdd(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Proveedor
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.nombre}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.telefono}</TableCell>
                <TableCell>{supplier.direccion}</TableCell>
                <TableCell>{supplier.ruc}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDelete(supplier.id!)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de Edición */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Modifica los datos del proveedor seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { field: 'nombre', label: 'Nombre' },
              { field: 'email', label: 'Email' },
              { field: 'telefono', label: 'Teléfono' },
              { field: 'direccion', label: 'Dirección' },
              { field: 'ruc', label: 'RUC' }
            ].map(({ field, label }) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right">
                  {label}
                </Label>
                <Input
                  id={field}
                  value={(currentSupplier as any)[field]}
                  onChange={(e) => setCurrentSupplier({
                    ...currentSupplier,
                    [field]: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Agregar Proveedor */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Agregar Proveedor</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo proveedor
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { field: 'nombre', label: 'Nombre' },
              { field: 'email', label: 'Email' },
              { field: 'telefono', label: 'Teléfono' },
              { field: 'direccion', label: 'Dirección' },
              { field: 'ruc', label: 'RUC' }
            ].map(({ field, label }) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right">
                  {label}
                </Label>
                <Input
                  id={field}
                  value={currentSupplier[field as keyof Supplier]}
                  onChange={(e) => setCurrentSupplier({
                    ...currentSupplier,
                    [field]: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Agregar Proveedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}