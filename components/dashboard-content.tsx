"use client"

import { useEffect, useState } from "react"
import { Calendar, Package, Truck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Entrega, Estoque } from "@/lib/database.types"
import { format, isToday, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  entregasHoje: number
  retirasHoje: number
  estoqueBaixo: number
  emLimpeza: number
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    entregasHoje: 0,
    retirasHoje: 0,
    estoqueBaixo: 0,
    emLimpeza: 0,
  })
  const [entregasHoje, setEntregasHoje] = useState<Entrega[]>([])
  const [alertasEstoque, setAlertasEstoque] = useState<Estoque[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const hoje = new Date()
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

      // Buscar entregas de hoje
      const { data: entregas } = await supabase
        .from("entregas")
        .select("*, cliente:clientes(*), itens:itens_entrega(*, produto:produtos(*))")
        .gte("data_entrega", inicioHoje)
        .lt("data_entrega", fimHoje)
        .order("data_entrega")

      // Buscar retiradas de hoje
      const { data: retiradas } = await supabase
        .from("entregas")
        .select("id")
        .gte("data_retirada", inicioHoje)
        .lt("data_retirada", fimHoje)

      // Buscar estoque
      const { data: estoque } = await supabase
        .from("estoque")
        .select("*, produto:produtos(*)")

      const estoqueBaixo = estoque?.filter(e => e.quantidade_disponivel <= 2) || []
      const emLimpeza = estoque?.reduce((acc, e) => acc + e.quantidade_limpeza, 0) || 0

      setEntregasHoje(entregas || [])
      setAlertasEstoque(estoqueBaixo)
      setStats({
        entregasHoje: entregas?.length || 0,
        retirasHoje: retiradas?.length || 0,
        estoqueBaixo: estoqueBaixo.length,
        emLimpeza,
      })
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregas Hoje
            </CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregasHoje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retiradas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retirasHoje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estoqueBaixo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Limpeza
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emLimpeza}</div>
          </CardContent>
        </Card>
      </div>

      {/* Entregas de Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Entregas de Hoje</CardTitle>
          <Link href="/agendamentos">
            <Button variant="outline" size="sm">Ver Todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {entregasHoje.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma entrega agendada para hoje
            </p>
          ) : (
            <div className="space-y-4">
              {entregasHoje.map((entrega) => (
                <div
                  key={entrega.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{entrega.cliente?.nome}</p>
                    <p className="text-sm text-muted-foreground">{entrega.endereco}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(entrega.data_entrega), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={entrega.status === "agendada" ? "secondary" : "default"}>
                    {entrega.status === "agendada" && "Agendada"}
                    {entrega.status === "em_rota" && "Em Rota"}
                    {entrega.status === "entregue" && "Entregue"}
                    {entrega.status === "retirada" && "Retirada"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Estoque */}
      {alertasEstoque.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas de Estoque
            </CardTitle>
            <Link href="/estoque">
              <Button variant="outline" size="sm">Gerenciar</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertasEstoque.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-background p-3"
                >
                  <span className="font-medium">{item.produto?.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.quantidade_disponivel} disponível
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
