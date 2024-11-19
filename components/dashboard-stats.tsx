"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Stat {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([
    {
      title: "Ventas Totales",
      value: "$0",
      description: "Cargando...",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Productos",
      value: "0",
      description: "Cargando...",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Compras",
      value: "$0",
      description: "Cargando...",
      icon: ShoppingCart,
      color: "text-orange-500",
    },
    {
      title: "Ganancia",
      value: "$0",
      description: "Cargando...",
      icon: TrendingUp,
      color: "text-purple-500",
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // URL base de la API
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Obtener estadísticas principales
        const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/`);

        // Actualizar los stats con los datos de la API
        const updatedStats: Stat[] = [
          {
            ...stats[0],
            value: `$${dashboardResponse.data.ventas_totales.toFixed(2)}`,
            description: "Último mes",
          },
          {
            ...stats[1],
            value: dashboardResponse.data.total_productos.toString(),
            description: "En inventario",
          },
          {
            ...stats[2],
            value: `$${dashboardResponse.data.compras_totales.toFixed(2)}`,
            description: "Último mes",
          },
          {
            ...stats[3],
            value: `$${dashboardResponse.data.ganancias.toFixed(2)}`,
            description: "Último mes",
          }
        ];

        setStats(updatedStats);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        toast({
          title: "Error al cargar estadísticas",
          description: "No se pudieron obtener las estadísticas del dashboard",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const renderLoadingState = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium bg-gray-200 h-4 w-20 rounded"></CardTitle>
            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gray-200 h-6 w-24 rounded mb-2"></div>
            <p className="text-xs text-muted-foreground bg-gray-200 h-3 w-16 rounded"></p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return loading ? renderLoadingState() : renderStats();
}