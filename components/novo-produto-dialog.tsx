"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface NovoProdutoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NovoProdutoDialog({
  open,
  onOpenChange,
  onSuccess,
}: NovoProdutoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    preco_unitario: "0",
    quantidade: "0",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const preco = parseFloat(form.preco_unitario.replace(",", ".")) || 0

      // Criar produto
      const { data: produto } = await supabase
        .from("produtos")
        .insert({
          nome: form.nome,
          preco_unitario: preco
        })
        .select("id")
        .single()

      if (produto) {
        // Criar estoque
        const quantidade = parseInt(form.quantidade) || 0
        await supabase.from("estoque").insert({
          produto_id: produto.id,
          quantidade_total: quantidade,
          quantidade_disponivel: quantidade,
          quantidade_limpeza: 0,
        })
      }

      setForm({ nome: "", preco_unitario: "0", quantidade: "0" })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Erro ao criar produto:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Jogo Mesa Redonda"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco_unitario">Preço Unitário (R$)</Label>
            <Input
              id="preco_unitario"
              type="number"
              step="0.01"
              min="0"
              value={form.preco_unitario}
              onChange={(e) => setForm({ ...form, preco_unitario: e.target.value })}
              placeholder="Ex: 15.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade Inicial</Label>
            <Input
              id="quantidade"
              type="number"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              min={0}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
