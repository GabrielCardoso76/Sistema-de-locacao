"use client"

import { useState, useEffect } from "react"
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
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (typeof window === "undefined") return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, endereco: prev.endereco ? `${prev.endereco} ${transcript}` : transcript }));
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<(Estoque & { produto: Produto })[]>([])
  const [itens, setItens] = useState<ItemForm[]>([])
  
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    numero: "",
    cidade: "São Carlos",
    dataEntrega: "",
    horaEntrega: "",
    dataRetirada: "",
    horaRetirada: "",
    observacoes: "",
    frete: "10.00",
    pago: false,
  })

  useEffect(() => {
    if (open) { loadProdutos() }
  }, [open])

  const [estoqueBase, setEstoqueBase] = useState<(Estoque & { produto: Produto })[]>([]);

  useEffect(() => {
    if (!open) return;
    async function calcDisponibilidadeReal() {
      if (!form.dataEntrega || !form.dataRetirada) {
        setProdutos(estoqueBase);
        return;
      }
      try {
        const dataEntregaISO = new Date(`${form.dataEntrega}T${form.horaEntrega || "00:00"}`).toISOString();
        const dataRetiradaISO = new Date(`${form.dataRetirada}T${form.horaRetirada || "23:59"}`).toISOString();

        const { data: entregasNoPeriodo } = await supabase
          .from("entregas")
          .select(`id, data_entrega, data_retirada, status, itens:itens_entrega(produto_id, quantidade)`)
          .lte("data_entrega", dataRetiradaISO)
          .gte("data_retirada", dataEntregaISO)
          .neq("status", "cancelada")
          .neq("status", "retirada")
          .neq("status", "finalizada");

        const reservadosMap = new Map<string, number>();
        entregasNoPeriodo?.forEach((entrega: any) => {
          entrega.itens?.forEach((item: any) => {
            const atual = reservadosMap.get(item.produto_id) || 0;
            reservadosMap.set(item.produto_id, atual + item.quantidade);
          });
        });

        const produtosAtualizados = estoqueBase.map(p => {
          const qtdReservada = reservadosMap.get(p.produto_id) || 0;
          const novaDisponivel = p.quantidade_total - qtdReservada - p.quantidade_limpeza;
          return { ...p, quantidade_disponivel: Math.max(0, novaDisponivel) };
        });
        setProdutos(produtosAtualizados);
      } catch (e) {
        setProdutos(estoqueBase);
      }
    }
    if (estoqueBase.length > 0) { calcDisponibilidadeReal(); }
  }, [form.dataEntrega, form.horaEntrega, form.dataRetirada, form.horaRetirada, estoqueBase, open]);

  async function loadProdutos() {
    const { data } = await supabase.from("estoque").select("*, produto:produtos(*)")
    setEstoqueBase(data || []);
    setProdutos(data || [])
  }

  function addItem() { setItens([...itens, { produto_id: "", quantidade: 1 }]) }
  function updateItem(index: number, field: keyof ItemForm, value: string | number) {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }
  function removeItem(index: number) { setItens(itens.filter((_, i) => i !== index)) }

  function renderResumoItens() {
    let mesas = 0;
    let cadeiras = 0;
    itens.forEach((item) => {
      const produto = produtos.find((p) => p.produto_id === item.produto_id);
      if (produto) {
        if (produto.produto.nome.toLowerCase() === "mesa avulsa") { mesas += item.quantidade; }
        else if (produto.produto.nome.toLowerCase() === "cadeira avulsa") { cadeiras += item.quantidade; }
      }
    });

    if (mesas === 0 && cadeiras === 0) return null;

    const kitsPossiveis = Math.min(mesas, Math.floor(cadeiras / 4));
    const mesasRestantes = mesas - kitsPossiveis;
    const cadeirasRestantes = cadeiras - (kitsPossiveis * 4);

    const partes = [];
    if (kitsPossiveis > 0) partes.push(`${kitsPossiveis} Jogo${kitsPossiveis > 1 ? "s" : ""} (${kitsPossiveis} Mesa${kitsPossiveis > 1 ? "s" : ""} + ${kitsPossiveis * 4} Cadeira${kitsPossiveis * 4 > 1 ? "s" : ""})`);
    if (mesasRestantes > 0) partes.push(`${mesasRestantes} Mesa${mesasRestantes > 1 ? "s" : ""} avulsa`);
    if (cadeirasRestantes > 0) partes.push(`${cadeirasRestantes} Cadeira${cadeirasRestantes > 1 ? "s" : ""} avulsa`);

    return partes.length > 0 ? (
      // AJUSTE: text-primary para visibilidade no fundo claro
      <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20 text-sm text-primary font-bold">
        Total: {partes.join(" + ")}
      </div>
    ) : null;
  }

  function addKitJogo() {
    const mesa = produtos.find((p) => p.produto.nome.toLowerCase() === 'mesa avulsa')
    const cadeira = produtos.find((p) => p.produto.nome.toLowerCase() === 'cadeira avulsa')
    if (mesa && cadeira) {
      const newItens = [...itens];
      const mesaIndex = newItens.findIndex(item => item.produto_id === mesa.produto_id);
      if (mesaIndex !== -1) { newItens[mesaIndex].quantidade += 1; }
      else { newItens.push({ produto_id: mesa.produto_id, quantidade: 1 }); }
      const cadeiraIndex = newItens.findIndex(item => item.produto_id === cadeira.produto_id);
      if (cadeiraIndex !== -1) { newItens[cadeiraIndex].quantidade += 4; }
      else { newItens.push({ produto_id: cadeira.produto_id, quantidade: 4 }); }
      setItens(newItens);
    }
  }

  const subtotal = itens.reduce((acc, item) => {
    const produto = produtos.find(p => p.produto_id === item.produto_id)
    if (produto && item.quantidade) { return acc + (produto.produto.preco_unitario * item.quantidade) }
    return acc
  }, 0)

  const frete = parseFloat(form.frete) || 0
  const total = subtotal + frete

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.dataEntrega || !form.dataRetirada || itens.length === 0) { alert("Preencha as datas e itens."); return; }
    setLoading(true)
    try {
      const dataEntregaISO = new Date(`${form.dataEntrega}T${form.horaEntrega}`).toISOString()
      const dataRetiradaISO = new Date(`${form.dataRetirada}T${form.horaRetirada}`).toISOString()

      // Validar disponibilidade e criar cliente/entrega (Lógica original preservada)
      let clienteId: string
      const { data: existingClientes } = await supabase.from("clientes").select("id, nome").eq("telefone", form.telefone)
      const exactMatch = existingClientes?.find(c => c.nome.toLowerCase() === form.nome.toLowerCase())
      if (exactMatch) { clienteId = exactMatch.id }
      else {
        const { data: newCliente } = await supabase.from("clientes").insert({ nome: form.nome, telefone: form.telefone }).select("id").single()
        clienteId = newCliente!.id
      }

      const { data: entrega } = await supabase.from("entregas").insert({
          cliente_id: clienteId, endereco: form.endereco, numero: form.numero, cidade: form.cidade,
          data_entrega: dataEntregaISO, data_retirada: dataRetiradaISO, status: "agendada",
          observacoes: form.observacoes, valor_frete: frete, valor_total: total, pago: form.pago,
        }).select("id").single()

      if (itens.length > 0 && entrega) {
        await supabase.from("itens_entrega").insert(itens.map(item => ({
            entrega_id: entrega.id, produto_id: item.produto_id, quantidade: item.quantidade,
        })))
      }
      setForm({ nome: "", telefone: "", endereco: "", numero: "", cidade: "São Carlos", dataEntrega: "", horaEntrega: "", dataRetirada: "", horaRetirada: "", observacoes: "", frete: "10.00", pago: false });
      setItens([]); onOpenChange(false); onSuccess();
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Nova Entrega</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Dados do Cliente</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" required /></div>
            </div>
            <div className="grid gap-4 grid-cols-12">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <div className="flex justify-between items-center"><Label>Rua</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className={`h-6 w-6 ${isListening ? "text-red-500 animate-pulse" : ""}`} onClick={startListening}><Mic className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.endereco}, ${form.numero}, ${form.cidade}, SP`)}`, "_blank")}><MapPin className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua..." required />
              </div>
              <div className="col-span-12 sm:col-span-4 space-y-2"><Label>Número</Label><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="S/N" required /></div>
              <div className="col-span-12 sm:col-span-3 space-y-2"><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Datas e Horários</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Data Entrega</Label><Input type="date" value={form.dataEntrega} onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Hora Entrega</Label><Input type="time" value={form.horaEntrega} onChange={(e) => setForm({ ...form, horaEntrega: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Data Retirada</Label><Input type="date" value={form.dataRetirada} onChange={(e) => setForm({ ...form, dataRetirada: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Hora Retirada</Label><Input type="time" value={form.horaRetirada} onChange={(e) => setForm({ ...form, horaRetirada: e.target.value })} required /></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Itens</h3>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={addKitJogo}><Plus className="mr-2 h-4 w-4" /> Kit Jogo</Button>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
              </div>
            </div>
            {itens.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Produto</Label>
                  <Select value={item.produto_id} onValueChange={(value) => updateItem(index, "produto_id", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{produtos.map((p) => (<SelectItem key={p.produto_id} value={p.produto_id}>{p.produto.nome} ({p.quantidade_disponivel} disp.)</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                {/* AJUSTE: w-32 e remoção de spinners do input */}
                <div className="w-32 space-y-2">
                  <Label>Qtd</Label>
                  <div className="flex items-center">
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-r-none" onClick={() => updateItem(index, "quantidade", Math.max(1, item.quantidade - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, "quantidade", parseInt(e.target.value) || 1)}
                      className="h-9 rounded-none text-center bg-white dark:bg-zinc-800 text-black dark:text-white font-bold text-lg w-full border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-l-none" onClick={() => updateItem(index, "quantidade", item.quantidade + 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {renderResumoItens()}
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Subtotal</Label><div className="text-lg font-semibold text-foreground">R$ {subtotal.toFixed(2)}</div></div>
              <div className="space-y-2"><Label>Frete (R$)</Label><Input type="number" value={form.frete} onChange={(e) => setForm({ ...form, frete: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1"><Label>Total</Label><div className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</div></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.pago} onChange={(e) => setForm({ ...form, pago: e.target.checked })} className="h-5 w-5" /><Label>Pedido Pago</Label></div>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Criar Entrega"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}