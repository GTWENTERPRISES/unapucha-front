'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  sku: z.string().min(3, {
    message: "El SKU debe tener al menos 3 caracteres.",
  }),
  precio: z.number().min(0, {
    message: "El precio no puede ser negativo.",
  }),
  stock: z.number().int().min(0, {
    message: "El stock no puede ser negativo.",
  }),
})

interface Product {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  categoria_nombre: string
  estado: string
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('http://localhost:8000/api/productos/', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  return res.json()
}

async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`http://localhost:8000/api/productos/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to update product')
  }
  return res.json()
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`http://localhost:8000/api/productos/${id}/`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Failed to delete product')
  }
}

function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void }) {
  return (
    <TableRow key={product.id}>
      <TableCell className="font-medium">{product.nombre}</TableCell>
      <TableCell>{product.sku}</TableCell>
      <TableCell>${product.precio}</TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>{product.categoria_nombre}</TableCell>
      <TableCell>
        <Badge
          variant={
            product.estado === "en_stock"
              ? "success"
              : product.estado === "bajo_stock"
              ? "warning"
              : "destructive"
          }
        >
          {product.estado === "en_stock" ? "En Stock" : 
           product.estado === "bajo_stock" ? "Bajo Stock" : "Sin Stock"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar producto</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Eliminar producto</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function EditProductDialog({ product, isOpen, onClose, onSave }: { product: Product | null; isOpen: boolean; onClose: () => void; onSave: (data: Partial<Product>) => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: product ? {
      nombre: product.nombre,
      sku: product.sku,
      precio: product.precio,
      stock: product.stock,
    } : {
      nombre: "",
      sku: "",
      precio: 0,
      stock: 0,
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre,
        sku: product.sku,
        precio: product.precio,
        stock: product.stock,
      })
    }
  }, [product, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Modifica los detalles del producto aquí.' : 'Añade un nuevo producto aquí.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
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
                    <Input placeholder="SKU del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Precio del producto" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                    <Input type="number" placeholder="Stock del producto" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DataTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  useEffect(() => {
    getProducts().then(setProducts).catch(error => {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.",
        variant: "destructive",
      })
    })
  }, [])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setProductToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSave = async (data: Partial<Product>) => {
    if (editingProduct) {
      try {
        const updatedProduct = await updateProduct(editingProduct.id, data)
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
        toast({
          title: "Éxito",
          description: "El producto ha sido actualizado correctamente.",
        })
      } catch (error) {
        console.error('Error updating product:', error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el producto. Por favor, intente de nuevo.",
          variant: "destructive",
        })
      }
    }
    setIsEditDialogOpen(false)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete)
        setProducts(products.filter(p => p.id !== productToDelete))
        toast({
          title: "Éxito",
          description: "El producto ha sido eliminado correctamente.",
        })
      } catch (error) {
        console.error('Error deleting product:', error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto. Por favor, intente de nuevo.",
          variant: "destructive",
        })
      }
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow 
              key={product.id} 
              product={product} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>

      <EditProductDialog 
        product={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Lista de Productos</h1>
      <DataTable />
    </div>
  )
}