"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Entrega } from "@/lib/database.types"
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react"

type Periodo = "dia" | "semana" | "mes" | "todos"

export function FinanceiroContent() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>("mes")

  async function loadFinanceiro() {
    setLoading(true)
    let query = supabase
      .from("entregas")
      .select("*, cliente:clientes(*)")
      .order("data_entrega", { ascending: false })

    const hoje = new Date()

    if (periodo === "dia") {
      query = query
        .gte("data_entrega", startOfDay(hoje).toISOString())
        .lt("data_entrega", endOfDay(hoje).toISOString())
    } else if (periodo === "semana") {
      query = query
        .gte("data_entrega", startOfWeek(hoje, { weekStartsOn: 1 }).toISOString())
        .lt("data_entrega", endOfWeek(hoje, { weekStartsOn: 1 }).toISOString())
    } else if (periodo === "mes") {
      query = query
        .gte("data_entrega", startOfMonth(hoje).toISOString())
        .lt("data_entrega", endOfMonth(hoje).toISOString())
    }

    const { data } = await query
    setEntregas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadFinanceiro()
  }, [periodo])

  const totalRecebido = entregas.filter((e) => e.pago).reduce((acc, e) => acc + (e.valor_total || 0), 0)
  const totalAReceber = entregas.filter((e) => !e.pago).reduce((acc, e) => acc + (e.valor_total || 0), 0)

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Já Recebido
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAReceber)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button variant={periodo === "dia" ? "default" : "outline"} onClick={() => setPeriodo("dia")}>
          Hoje
        </Button>
        <Button variant={periodo === "semana" ? "default" : "outline"} onClick={() => setPeriodo("semana")}>
          Nesta Semana
        </Button>
        <Button variant={periodo === "mes" ? "default" : "outline"} onClick={() => setPeriodo("mes")}>
          Neste Mês
        </Button>
        <Button variant={periodo === "todos" ? "default" : "outline"} onClick={() => setPeriodo("todos")}>
          Todos
        </Button>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : entregas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma transação encontrada no período.
            </div>
          ) : (
            <div className="space-y-3">
              {entregas.map((entrega) => (
                <div
                  key={entrega.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{entrega.cliente?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(entrega.data_entrega), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entrega.valor_total || 0)}
                    </div>
                    <div>
                      {entrega.pago ? (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white">Recebido</Badge>
                      ) : (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pendente</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
