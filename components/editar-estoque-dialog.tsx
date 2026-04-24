"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import type { Estoque, Produto } from "@/lib/database.types"

type EstoqueComProduto = Estoque & { produto: Produto }

interface EditarEstoqueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  estoque: EstoqueComProduto | null
  onSuccess: () => void
}

export function EditarEstoqueDialog({
  open,
  onOpenChange,
  estoque,
  onSuccess,
}: EditarEstoqueDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    quantidade_total: 0,
    quantidade_disponivel: 0,
    quantidade_limpeza: 0,
  })

  useEffect(() => {
    if (estoque) {
      setForm({
        quantidade_total: estoque.quantidade_total,
        quantidade_disponivel: estoque.quantidade_disponivel,
        quantidade_limpeza: estoque.quantidade_limpeza,
      })
    }
  }, [estoque])

  if (!estoque) return null

  const emUso = form.quantidade_total - form.quantidade_disponivel - form.quantidade_limpeza

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await supabase
        .from("estoque")
        .update({
          quantidade_total: form.quantidade_total,
          quantidade_disponivel: form.quantidade_disponivel,
          quantidade_limpeza: form.quantidade_limpeza,
        })
        .eq("id", estoque!.id)

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error)
    } finally {
      setLoading(false)
    }
  }

  function adjustValue(field: keyof typeof form, delta: number) {
    const newValue = Math.max(0, form[field] + delta)
    setForm({ ...form, [field]: newValue })
  }

  // Mover de disponivel para limpeza
  function moverParaLimpeza() {
    if (form.quantidade_disponivel > 0) {
      setForm({
        ...form,
        quantidade_disponivel: form.quantidade_disponivel - 1,
        quantidade_limpeza: form.quantidade_limpeza + 1,
      })
    }
  }

  // Mover de limpeza para disponivel
  function moverParaDisponivel() {
    if (form.quantidade_limpeza > 0) {
      setForm({
        ...form,
        quantidade_limpeza: form.quantidade_limpeza - 1,
        quantidade_disponivel: form.quantidade_disponivel + 1,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Estoque - {estoque.produto.nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantidade Total */}
          <div className="space-y-2">
            <Label>Quantidade Total</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("quantidade_total", -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={form.quantidade_total}
                onChange={(e) =>
                  setForm({ ...form, quantidade_total: parseInt(e.target.value) || 0 })
                }
                className="text-center"
                min={0}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("quantidade_total", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status dos Itens */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium">Status dos Itens</h4>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-success">
                  {form.quantidade_disponivel}
                </div>
                <div className="text-xs text-muted-foreground">Disponivel</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {emUso}
                </div>
                <div className="text-xs text-muted-foreground">Em Uso</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-warning">
                  {form.quantidade_limpeza}
                </div>
                <div className="text-xs text-muted-foreground">Limpeza</div>
              </div>
            </div>

            {/* Acoes rapidas */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={moverParaLimpeza}
                disabled={form.quantidade_disponivel === 0}
              >
                Mover para Limpeza
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={moverParaDisponivel}
                disabled={form.quantidade_limpeza === 0}
              >
                Mover para Disponivel
              </Button>
            </div>
          </div>

          {/* Ajuste Manual */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Disponivel</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("quantidade_disponivel", -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={form.quantidade_disponivel}
                  onChange={(e) =>
                    setForm({ ...form, quantidade_disponivel: parseInt(e.target.value) || 0 })
                  }
                  className="text-center"
                  min={0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("quantidade_disponivel", 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Em Limpeza</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("quantidade_limpeza", -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={form.quantidade_limpeza}
                  onChange={(e) =>
                    setForm({ ...form, quantidade_limpeza: parseInt(e.target.value) || 0 })
                  }
                  className="text-center"
                  min={0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("quantidade_limpeza", 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
