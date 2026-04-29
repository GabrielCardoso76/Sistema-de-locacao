"use client"

import { useEffect, useState } from "react"
import { Plus, Package, Sparkles, AlertTriangle, Edit2, Trash2, Calendar as CalendarIcon, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { supabase } from "@/lib/supabase"
import type { Estoque, Produto } from "@/lib/database.types"
import { NovoProdutoDialog } from "@/components/novo-produto-dialog"
import { EditarEstoqueDialog } from "@/components/editar-estoque-dialog"
import { format, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type EstoqueComProduto = Estoque & {
  produto: Produto
  reservados_na_data?: number
}

export function EstoqueContent() {
  const [estoque, setEstoque] = useState<EstoqueComProduto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueComProduto | null>(null)

  // States para exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [estoqueToDelete, setEstoqueToDelete] = useState<EstoqueComProduto | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Filtro de data
  const [filtroData, setFiltroData] = useState<Date | undefined>(undefined)

  async function loadEstoque() {
    setLoading(true)
    const { data: estoqueData } = await supabase
      .from("estoque")
      .select("*, produto:produtos(*)")
      .order("produto_id")

    let estoqueProcessado = estoqueData || []

    if (filtroData && estoqueProcessado.length > 0) {
      const inicioFiltro = startOfDay(filtroData).toISOString()
      const fimFiltro = endOfDay(filtroData).toISOString()

      // Buscar entregas que cruzam com esta data
      // data_entrega <= fim do dia E data_retirada >= inicio do dia
      const { data: entregasComItens } = await supabase
        .from('itens_entrega')
        .select(`
          produto_id,
          quantidade,
          entregas!inner(
            data_entrega,
            data_retirada,
            status
          )
        `)
        .lte('entregas.data_entrega', fimFiltro)
        .gte('entregas.data_retirada', inicioFiltro)
        .neq('entregas.status', 'cancelada')
        .neq('entregas.status', 'retirada') // já devolveu

      const reservadosMap = new Map<string, number>()

      entregasComItens?.forEach((item: any) => {
        const atual = reservadosMap.get(item.produto_id) || 0
        reservadosMap.set(item.produto_id, atual + item.quantidade)
      })

      estoqueProcessado = estoqueProcessado.map(item => ({
        ...item,
        reservados_na_data: reservadosMap.get(item.produto_id) || 0
      }))
    }

    setEstoque(estoqueProcessado)
    setLoading(false)
  }

  useEffect(() => {
    loadEstoque()
  }, [filtroData])

  async function handleDeleteCheck(item: EstoqueComProduto) {
    setEstoqueToDelete(item)
    setDeleteError(null)

    // Verificar se tem agendamentos futuros
    const hoje = startOfDay(new Date()).toISOString()

    const { data: entregasComItem } = await supabase
      .from('itens_entrega')
      .select('entrega_id, entregas(data_entrega, status)')
      .eq('produto_id', item.produto_id)

    // Filtrar apenas entregas ativas/futuras
    const temAgendamentos = entregasComItem?.some(itemEntrega => {
      const entrega = itemEntrega.entregas as any
      if (!entrega) return false

      const ehAtiva = !['entregue', 'retirada', 'cancelada'].includes(entrega.status)
      const ehFutura = new Date(entrega.data_entrega) >= new Date(hoje)

      return ehAtiva || ehFutura
    })

    if (temAgendamentos) {
      setDeleteError("Este item não pode ser excluído pois existem agendamentos futuros ou ativos vinculados a ele.")
    }

    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!estoqueToDelete) return

    try {
      // Deletar o estoque primeiro (por causa de chaves estrangeiras, se tiver cascade é mais fácil)
      await supabase.from('estoque').delete().eq('id', estoqueToDelete.id)
      await supabase.from('produtos').delete().eq('id', estoqueToDelete.produto_id)

      setDeleteDialogOpen(false)
      loadEstoque()
    } catch (error) {
      console.error("Erro ao excluir item:", error)
    }
  }

  const totalItens = estoque.reduce((acc, e) => acc + e.quantidade_total, 0)
  const totalDisponivel = estoque.reduce((acc, e) => acc + e.quantidade_disponivel, 0)
  const totalLimpeza = estoque.reduce((acc, e) => acc + e.quantidade_limpeza, 0)
  const emUso = totalItens - totalDisponivel - totalLimpeza

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItens}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponivel
            </CardTitle>
            <div className="h-3 w-3 rounded-full bg-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalDisponivel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Uso
            </CardTitle>
            <div className="h-3 w-3 rounded-full bg-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{emUso}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Limpeza
            </CardTitle>
            <Sparkles className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalLimpeza}</div>
          </CardContent>
        </Card>
      </div>

      {/* Acoes e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !filtroData && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filtroData ? format(filtroData, "PPP", { locale: ptBR }) : <span>Ver disponibilidade por data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
              <Calendar
                mode="single"
                selected={filtroData}
                onSelect={(date) => {
                  setFiltroData(date)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {filtroData && (
            <Button variant="ghost" size="icon" onClick={() => setFiltroData(undefined)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : estoque.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum produto cadastrado
            </div>
          ) : (
            <div className="space-y-4">
              {estoque.map((item) => {
                const total = item.quantidade_total

                let disponivelDisplay: number
                let emUsoDisplay: number

                if (filtroData) {
                  // Modo filtro futuro
                  emUsoDisplay = item.reservados_na_data || 0
                  disponivelDisplay = total - emUsoDisplay
                } else {
                  // Modo tempo real atual
                  disponivelDisplay = item.quantidade_disponivel
                  emUsoDisplay = total - disponivelDisplay - item.quantidade_limpeza
                }

                const limpeza = item.quantidade_limpeza
                const percentDisponivel = total > 0 ? (disponivelDisplay / total) * 100 : 0

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.produto.nome}</h3>
                          {disponivelDisplay <= 2 && (
                            <Badge variant="outline" className="border-warning text-warning">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Baixo
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            {disponivelDisplay} disponível
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {emUsoDisplay} {filtroData ? 'reservados' : 'em uso'}
                          </span>
                          {!filtroData && (
                            <span className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-warning" />
                              {limpeza} limpeza
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={percentDisponivel} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {total} total
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEstoque(item)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteCheck(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <NovoProdutoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadEstoque}
      />

      <EditarEstoqueDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        estoque={selectedEstoque}
        onSuccess={loadEstoque}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Tem certeza que deseja excluir <strong>{estoqueToDelete?.produto.nome}</strong>?</p>
                {deleteError && (
                  <p className="text-destructive font-medium mt-2">
                    {deleteError}
                  </p>
                )}
                {!deleteError && (
                  <p>Esta ação não poderá ser desfeita e removerá o item completamente do sistema.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                if (deleteError) {
                  e.preventDefault()
                  setDeleteDialogOpen(false)
                } else {
                  confirmDelete()
                }
              }}
              className={deleteError ? "bg-primary" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {deleteError ? "Entendi" : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
