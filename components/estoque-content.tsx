"use client"

import { useEffect, useState } from "react"
import { Plus, Package, Sparkles, AlertTriangle, Edit2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import type { Estoque, Produto } from "@/lib/database.types"
import { NovoProdutoDialog } from "@/components/novo-produto-dialog"
import { EditarEstoqueDialog } from "@/components/editar-estoque-dialog"

type EstoqueComProduto = Estoque & { produto: Produto }

export function EstoqueContent() {
  const [estoque, setEstoque] = useState<EstoqueComProduto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueComProduto | null>(null)

  async function loadEstoque() {
    setLoading(true)
    const { data } = await supabase
      .from("estoque")
      .select("*, produto:produtos(*)")
      .order("produto_id")
    setEstoque(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEstoque()
  }, [])

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

      {/* Acoes */}
      <div className="flex justify-end">
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
                const disponivel = item.quantidade_disponivel
                const limpeza = item.quantidade_limpeza
                const total = item.quantidade_total
                const emUsoItem = total - disponivel - limpeza
                const percentDisponivel = total > 0 ? (disponivel / total) * 100 : 0

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.produto.nome}</h3>
                          {disponivel <= 2 && (
                            <Badge variant="outline" className="border-warning text-warning">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Baixo
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            {disponivel} disponivel
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {emUsoItem} em uso
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-warning" />
                            {limpeza} limpeza
                          </span>
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
    </div>
  )
}
