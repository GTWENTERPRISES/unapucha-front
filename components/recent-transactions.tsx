"use client"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  tipo: 'Venta' | 'Compra';
  producto: string;
  monto: number;
  fecha: string;
  estado: 'completed' | 'processing';
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        // URL base de la API
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Obtener transacciones recientes
        const response = await axios.get(`${BASE_URL}/api/dashboard/transacciones-recientes/`);

        // Transformar los datos si es necesario
        const formattedTransactions = response.data.transacciones.map((transaction: any) => ({
          id: transaction.id.toString(),
          tipo: transaction.tipo,
          producto: transaction.producto,
          monto: transaction.monto,
          fecha: new Date(transaction.fecha).toISOString().split('T')[0],
          estado: transaction.estado
        }));

        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
        toast({
          title: "Error al cargar transacciones",
          description: "No se pudieron obtener las transacciones recientes",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  const renderLoadingState = () => (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>Cargando transacciones...</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(4)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderTransactions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>
          Últimas transacciones realizadas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay transacciones recientes
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge
                      variant={transaction.tipo === "Venta" ? "default" : "secondary"}
                    >
                      {transaction.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.producto}</TableCell>
                  <TableCell>${transaction.monto.toFixed(2)}</TableCell>
                  <TableCell>{transaction.fecha}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.estado === "completed"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {transaction.estado === "completed"
                        ? "Completado"
                        : "Procesando"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return loading ? renderLoadingState() : renderTransactions();
}