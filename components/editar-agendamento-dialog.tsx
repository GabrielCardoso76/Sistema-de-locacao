"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Plus, Minus, Trash2, Mic, MapPin } from "lucide-react"
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

export function EditarAgendamentoDialog({
  open,
  onOpenChange,
  onSuccess,
  entrega,
}: any) {
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<(Estoque & { produto: Produto })[]>([])
  const [itens, setItens] = useState<any[]>([])
  const [form, setForm] = useState({
    nome: "", telefone: "", endereco: "", numero: "", cidade: "São Carlos",
    dataEntrega: "", horaEntrega: "", dataRetirada: "", horaRetirada: "",
    observacoes: "", frete: "10.00", pago: false,
  })

  useEffect(() => {
    if (open && entrega) {
      loadProdutos()
      setForm({
        nome: entrega.cliente?.nome || "",
        telefone: entrega.cliente?.telefone || "",
        endereco: entrega.endereco || "",
        numero: entrega.numero || "",
        cidade: entrega.cidade || "São Carlos",
        dataEntrega: entrega.data_entrega ? format(parseISO(entrega.data_entrega), "yyyy-MM-dd") : "",
        horaEntrega: entrega.data_entrega ? format(parseISO(entrega.data_entrega), "HH:mm") : "",
        dataRetirada: entrega.data_retirada ? format(parseISO(entrega.data_retirada), "yyyy-MM-dd") : "",
        horaRetirada: entrega.data_retirada ? format(parseISO(entrega.data_retirada), "HH:mm") : "",
        observacoes: entrega.observacoes || "",
        frete: entrega.valor_frete ? entrega.valor_frete.toString() : "10.00",
        pago: entrega.pago || false,
      })
      setItens(entrega.itens?.map((i: any) => ({ produto_id: i.produto_id, quantidade: i.quantidade })) || [])
    }
  }, [open, entrega])

  async function loadProdutos() {
    const { data } = await supabase.from("estoque").select("*, produto:produtos(*)")
    setProdutos(data || [])
  }

  function updateItem(index: number, field: string, value: any) {
    const newItens = [...itens]; newItens[index] = { ...newItens[index], [field]: value }; setItens(newItens)
  }

  function renderResumoItens() {
    let m = 0; let c = 0;
    itens.forEach((i) => {
      const p = produtos.find((prod) => prod.produto_id === i.produto_id);
      if (p?.produto.nome.toLowerCase() === "mesa avulsa") m += i.quantidade;
      if (p?.produto.nome.toLowerCase() === "cadeira avulsa") c += i.quantidade;
    });
    if (m === 0 && c === 0) return null;
    const kits = Math.min(m, Math.floor(c / 4));
    return (
      // AJUSTE: text-primary font-bold para visibilidade
      <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20 text-sm text-primary font-bold">
        Total: {kits} Jogo{kits !== 1 ? 's' : ''} ({kits} Mesas + {kits * 4} Cadeiras)
      </div>
    );
  }

  const subtotal = itens.reduce((acc, i) => {
    const p = produtos.find(prod => prod.produto_id === i.produto_id)
    return p ? acc + (p.produto.preco_unitario * i.quantidade) : acc
  }, 0)

  async function handleSubmit(e: any) {
    e.preventDefault(); setLoading(true)
    try {
      await supabase.from("entregas").update({
        endereco: form.endereco, numero: form.numero, valor_frete: parseFloat(form.frete),
        valor_total: subtotal + parseFloat(form.frete), pago: form.pago,
        data_entrega: new Date(`${form.dataEntrega}T${form.horaEntrega}`).toISOString(),
        data_retirada: new Date(`${form.dataRetirada}T${form.horaRetirada}`).toISOString(),
      }).eq("id", entrega.id)
      await supabase.from("itens_entrega").delete().eq("entrega_id", entrega.id)
      await supabase.from("itens_entrega").insert(itens.map(i => ({ entrega_id: entrega.id, produto_id: i.produto_id, quantidade: i.quantidade })))
      onOpenChange(false); onSuccess();
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Editar Entrega</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} disabled /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} disabled /></div>
          </div>
          <div className="grid gap-4 grid-cols-12">
            <div className="col-span-8 space-y-2"><Label>Rua</Label><Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} /></div>
            <div className="col-span-4 space-y-2"><Label>Número</Label><Input value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} /></div>
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Itens</Label>
            {itens.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={item.produto_id} onValueChange={v => updateItem(index, "produto_id", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{produtos.map(p => <SelectItem key={p.produto_id} value={p.produto_id}>{p.produto.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {/* AJUSTE: w-32 e remoção de spinners do input */}
                <div className="w-32 flex items-center">
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-r-none" onClick={() => updateItem(index, "quantidade", Math.max(1, item.quantidade - 1))}><Minus className="h-4 w-4" /></Button>
                  <Input 
                    type="number" 
                    value={item.quantidade} 
                    onChange={e => updateItem(index, "quantidade", parseInt(e.target.value) || 1)}
                    className="h-9 rounded-none text-center bg-background font-bold text-lg w-full border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-l-none" onClick={() => updateItem(index, "quantidade", item.quantidade + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setItens(itens.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {renderResumoItens()}
          </div>

          <div className="p-4 bg-muted border rounded-lg flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">R$ {(subtotal + parseFloat(form.frete)).toFixed(2)}</div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={form.pago} onChange={e => setForm({...form, pago: e.target.checked})} /><Label>Pago</Label></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar Alterações"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}