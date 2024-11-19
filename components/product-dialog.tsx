"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  sku: z.string().min(3, {
    message: "El SKU debe tener al menos 3 caracteres.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "El precio debe ser un número válido.",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)), {
    message: "El stock debe ser un número válido.",
  }),
  category: z.string({
    required_error: "Por favor seleccione una categoría.",
  }),
});

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdd?: (product: any) => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({ 
  open, 
  onOpenChange,
  onProductAdd 
}) => {
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/categorias/');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error fetching categorias:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCategorias();
    }
  }, [open, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      stock: "",
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post('http://localhost:8000/api/productos/', {
        nombre: values.name,
        sku: values.sku,
        precio: values.price,
        stock: parseInt(values.stock),
        stock_minimo: 5, // Default minimum stock
        categoria: values.category
      });

      onProductAdd?.(response.data);

      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado exitosamente.",
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto.",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Laptop Dell XPS 13" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="LAP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="999.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <div className="p-2 text-center">Cargando...</div>
                      ) : categorias.length === 0 ? (
                        <div className="p-2 text-center">No hay categorías disponibles</div>
                      ) : (
                        categorias.map((categoria) => (
                          <SelectItem 
                            key={categoria.id} 
                            value={categoria.id.toString()}
                          >
                            {categoria.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Guardar Producto
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};