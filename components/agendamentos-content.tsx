"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Calendar, Eye, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Entrega } from "@/lib/database.types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { NovoAgendamentoDialog } from "@/components/novo-agendamento-dialog"
import { DetalhesEntregaDialog } from "@/components/detalhes-entrega-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AgendamentosContent() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detalhesOpen, setDetalhesOpen] = useState(false)
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entregaToDelete, setEntregaToDelete] = useState<Entrega | null>(null)

  async function loadEntregas() {
    setLoading(true)
    let query = supabase
      .from("entregas")
      .select("*, cliente:clientes(*), itens:itens_entrega(*, produto:produtos(*))")
      .order("data_entrega", { ascending: true })

    if (statusFilter !== "todos") {
      query = query.eq("status", statusFilter)
    }

    const { data } = await query
    setEntregas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEntregas()
  }, [statusFilter])

  const filteredEntregas = entregas.filter((e) =>
    e.cliente?.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.endereco.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!entregaToDelete) return
    
    await supabase.from("itens_entrega").delete().eq("entrega_id", entregaToDelete.id)
    await supabase.from("entregas").delete().eq("id", entregaToDelete.id)
    
    setDeleteDialogOpen(false)
    setEntregaToDelete(null)
    loadEntregas()
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "agendada":
        return <Badge variant="secondary">Agendada</Badge>
      case "em_rota":
        return <Badge className="bg-primary">Em Rota</Badge>
      case "entregue":
        return <Badge className="bg-success text-success-foreground">Entregue</Badge>
      case "retirada":
        return <Badge variant="outline">Retirada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Ações e Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou endereço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="agendada">Agendada</SelectItem>
              <SelectItem value="em_rota">Em Rota</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="retirada">Retirada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrega
        </Button>
      </div>

      {/* Lista de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Entregas Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredEntregas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma entrega encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntregas.map((entrega) => (
                <div
                  key={entrega.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{entrega.cliente?.nome}</p>
                      {getStatusBadge(entrega.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{entrega.endereco}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        Entrega: {format(parseISO(entrega.data_entrega), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      <span>
                        Retirada: {format(parseISO(entrega.data_retirada), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    {entrega.itens && entrega.itens.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entrega.itens.map((item) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.quantidade}x {item.produto?.nome}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEntrega(entrega)
                        setDetalhesOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => {
                        setEntregaToDelete(entrega)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NovoAgendamentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadEntregas}
      />

      <DetalhesEntregaDialog
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
        entrega={selectedEntrega}
        onSuccess={loadEntregas}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
