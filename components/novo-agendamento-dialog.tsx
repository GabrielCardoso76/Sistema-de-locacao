"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Produto, Estoque } from "@/lib/database.types"

interface NovoAgendamentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ItemForm {
  produto_id: string
  quantidade: number
}

export function NovoAgendamentoDialog({
  open,
  onOpenChange,
  onSuccess,
}: NovoAgendamentoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<(Estoque & { produto: Produto })[]>([])
  const [itens, setItens] = useState<ItemForm[]>([])
  
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    numero: "",
    dataEntrega: "",
    horaEntrega: "",
    dataRetirada: "",
    horaRetirada: "",
    observacoes: "",
  })

  useEffect(() => {
    if (open) {
      loadProdutos()
    }
  }, [open])

  async function loadProdutos() {
    const { data } = await supabase
      .from("estoque")
      .select("*, produto:produtos(*)")
    setProdutos(data || [])
  }

  function addItem() {
    setItens([...itens, { produto_id: "", quantidade: 1 }])
  }

  function updateItem(index: number, field: keyof ItemForm, value: string | number) {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }

  function removeItem(index: number) {
    setItens(itens.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar datas e itens
    if (!form.dataEntrega || !form.dataRetirada || itens.length === 0) {
      alert("Preencha as datas e adicione pelo menos um item.")
      return
    }

    setLoading(true)

    try {
      // Validar disponibilidade de estoque no periodo
      const dataEntregaISO = new Date(`${form.dataEntrega}T${form.horaEntrega}`).toISOString()
      const dataRetiradaISO = new Date(`${form.dataRetirada}T${form.horaRetirada}`).toISOString()

      const { data: entregasNoPeriodo } = await supabase
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
        .lte('entregas.data_entrega', dataRetiradaISO)
        .gte('entregas.data_retirada', dataEntregaISO)
        .neq('entregas.status', 'cancelada')
        .neq('entregas.status', 'retirada')

      const reservadosMap = new Map<string, number>()
      entregasNoPeriodo?.forEach((item: any) => {
        const atual = reservadosMap.get(item.produto_id) || 0
        reservadosMap.set(item.produto_id, atual + item.quantidade)
      })

      // Checar contra o estoque total de cada item selecionado
      for (const item of itens) {
        if (!item.produto_id) continue;

        const produtoEstoque = produtos.find(p => p.produto_id === item.produto_id)
        if (!produtoEstoque) continue;

        const qtdReservada = reservadosMap.get(item.produto_id) || 0
        const disponivel = produtoEstoque.quantidade_total - qtdReservada

        if (item.quantidade > disponivel) {
          alert(`Estoque insuficiente para ${produtoEstoque.produto.nome} neste período.\n\nDisponível calculado: ${disponivel}\nSolicitado: ${item.quantidade}`)
          setLoading(false)
          return
        }
      }

      // Criar ou buscar cliente
      let clienteId: string

      const { data: existingClientes } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("telefone", form.telefone)

      const exactMatch = existingClientes?.find(c => c.nome.toLowerCase() === form.nome.toLowerCase())

      if (exactMatch) {
        clienteId = exactMatch.id
      } else {
        // Create new client if name is different or telephone doesn't exist
        const { data: newCliente } = await supabase
          .from("clientes")
          .insert({ nome: form.nome, telefone: form.telefone })
          .select("id")
          .single()
        clienteId = newCliente!.id
      }

      // Criar entrega
      const dataEntrega = new Date(`${form.dataEntrega}T${form.horaEntrega}`)
      const dataRetirada = new Date(`${form.dataRetirada}T${form.horaRetirada}`)

      const { data: entrega } = await supabase
        .from("entregas")
        .insert({
          cliente_id: clienteId,
          endereco: form.endereco,
          numero: form.numero || null,
          data_entrega: dataEntrega.toISOString(),
          data_retirada: dataRetirada.toISOString(),
          status: "agendada",
          observacoes: form.observacoes || null,
        })
        .select("id")
        .single()

      // Criar itens da entrega
      if (itens.length > 0 && entrega) {
        const itensToInsert = itens
          .filter(item => item.produto_id)
          .map(item => ({
            entrega_id: entrega.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
          }))

        if (itensToInsert.length > 0) {
          await supabase.from("itens_entrega").insert(itensToInsert)
        }
      }

      // Resetar form
      setForm({
        nome: "",
        telefone: "",
        endereco: "",
        numero: "",
        dataEntrega: "",
        horaEntrega: "",
        dataRetirada: "",
        horaRetirada: "",
        observacoes: "",
      })
      setItens([])
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Entrega</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-medium">Dados do Cliente</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, bairro, cidade"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="S/N"
                />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="font-medium">Datas e Horários</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataEntrega">Data da Entrega</Label>
                <Input
                  id="dataEntrega"
                  type="date"
                  value={form.dataEntrega}
                  onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaEntrega">Hora da Entrega</Label>
                <Input
                  id="horaEntrega"
                  type="time"
                  value={form.horaEntrega}
                  onChange={(e) => setForm({ ...form, horaEntrega: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataRetirada">Data da Retirada</Label>
                <Input
                  id="dataRetirada"
                  type="date"
                  value={form.dataRetirada}
                  onChange={(e) => setForm({ ...form, dataRetirada: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaRetirada">Hora da Retirada</Label>
                <Input
                  id="horaRetirada"
                  type="time"
                  value={form.horaRetirada}
                  onChange={(e) => setForm({ ...form, horaRetirada: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Itens</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
            {itens.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item adicionado
              </p>
            ) : (
              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Produto</Label>
                      <Select
                        value={item.produto_id}
                        onValueChange={(value) => updateItem(index, "produto_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((p) => (
                            <SelectItem key={p.produto_id} value={p.produto_id}>
                              {p.produto.nome} ({p.quantidade_disponivel} disponível)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Qtd</Label>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-r-none"
                          onClick={() => updateItem(index, "quantidade", Math.max(1, item.quantidade - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => updateItem(index, "quantidade", parseInt(e.target.value) || 1)}
                          className="h-9 rounded-none text-center"
                          min={1}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-l-none"
                          onClick={() => updateItem(index, "quantidade", item.quantidade + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a entrega..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Entrega"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
