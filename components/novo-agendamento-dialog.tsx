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
    // @ts-ignore - SpeechRecognition is not strictly typed in all browsers
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, endereco: prev.endereco ? `${prev.endereco} ${transcript}` : transcript }));
    };

    recognition.onerror = (event: any) => {
      console.error("Erro de reconhecimento:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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
    if (open) {
      loadProdutos()
    }
  }, [open])

  // Estado para guardar o estoque base original
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
          .select(`
            id,
            data_entrega,
            data_retirada,
            status,
            itens:itens_entrega(produto_id, quantidade)
          `)
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
        console.error("Erro ao calcular disponibilidade:", e);
        setProdutos(estoqueBase);
      }
    }

    if (estoqueBase.length > 0) {
      calcDisponibilidadeReal();
    }
  }, [form.dataEntrega, form.horaEntrega, form.dataRetirada, form.horaRetirada, estoqueBase, open]);

  async function loadProdutos() {
    const { data } = await supabase
      .from("estoque")
      .select("*, produto:produtos(*)")
    setEstoqueBase(data || []);
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

  function renderResumoItens() {
    let mesas = 0;
    let cadeiras = 0;

    itens.forEach((item) => {
      const produto = produtos.find((p) => p.produto_id === item.produto_id);
      if (produto) {
        if (produto.produto.nome.toLowerCase() === "mesa avulsa") {
          mesas += item.quantidade;
        } else if (produto.produto.nome.toLowerCase() === "cadeira avulsa") {
          cadeiras += item.quantidade;
        }
      }
    });

    if (mesas === 0 && cadeiras === 0) return null;

    const kitsPossiveis = Math.min(mesas, Math.floor(cadeiras / 4));
    const mesasRestantes = mesas - kitsPossiveis;
    const cadeirasRestantes = cadeiras - (kitsPossiveis * 4);

    const partes = [];
    if (kitsPossiveis > 0) partes.push(`${kitsPossiveis} Jogo${kitsPossiveis > 1 ? "s" : ""} (${kitsPossiveis} Mesa${kitsPossiveis > 1 ? "s" : ""} + ${kitsPossiveis * 4} Cadeira${kitsPossiveis * 4 > 1 ? "s" : ""})`);
    if (mesasRestantes > 0) partes.push(`${mesasRestantes} Mesa${mesasRestantes > 1 ? "s" : ""} avulsa${mesasRestantes > 1 ? "s" : ""}`);
    if (cadeirasRestantes > 0) partes.push(`${cadeirasRestantes} Cadeira${cadeirasRestantes > 1 ? "s" : ""} avulsa${cadeirasRestantes > 1 ? "s" : ""}`);

    return partes.length > 0 ? (
      <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20 text-sm text-primary-foreground/90 font-medium dark:text-primary-foreground">
        Total: {partes.join(" + ")}
      </div>
    ) : null;
  }

  function addKitJogo() {
    const mesa = produtos.find((p) => p.produto.nome.toLowerCase() === 'mesa avulsa')
    const cadeira = produtos.find((p) => p.produto.nome.toLowerCase() === 'cadeira avulsa')

    if (mesa && cadeira) {
      // Check if they are already in the items list, update quantity if they are, otherwise add them
      const newItens = [...itens];

      const mesaIndex = newItens.findIndex(item => item.produto_id === mesa.produto_id);
      if (mesaIndex !== -1) {
        newItens[mesaIndex].quantidade += 1;
      } else {
        newItens.push({ produto_id: mesa.produto_id, quantidade: 1 });
      }

      const cadeiraIndex = newItens.findIndex(item => item.produto_id === cadeira.produto_id);
      if (cadeiraIndex !== -1) {
        newItens[cadeiraIndex].quantidade += 4;
      } else {
        newItens.push({ produto_id: cadeira.produto_id, quantidade: 4 });
      }

      setItens(newItens);
    } else {
      alert("Produtos 'Mesa Avulsa' e/o 'Cadeira Avulsa' não encontrados no estoque. Adicione-os primeiro para usar a função Kit.")
    }
  }

  const subtotal = itens.reduce((acc, item) => {
    const produto = produtos.find(p => p.produto_id === item.produto_id)
    if (produto && item.quantidade) {
      return acc + (produto.produto.preco_unitario * item.quantidade)
    }
    return acc
  }, 0)

  const frete = parseFloat(form.frete) || 0
  const total = subtotal + frete

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar datas, número e itens
    if (!form.dataEntrega || !form.dataRetirada || itens.length === 0) {
      alert("Preencha as datas e adicione pelo menos um item.")
      return
    }

    if (!form.numero) {
      alert("Preencha o número da residência. Se não houver, coloque S/N.")
      return
    }

    setLoading(true)

    try {
      // Validar conflitos de horario
      const dataEntregaISO = new Date(`${form.dataEntrega}T${form.horaEntrega}`).toISOString()
      const dataRetiradaISO = new Date(`${form.dataRetirada}T${form.horaRetirada}`).toISOString()

      const { data: conflitosEntrega } = await supabase
        .from('entregas')
        .select('id')
        .eq('data_entrega', dataEntregaISO)
        .limit(1)

      const { data: conflitosRetirada } = await supabase
        .from('entregas')
        .select('id')
        .eq('data_retirada', dataRetiradaISO)
        .limit(1)

      if ((conflitosEntrega && conflitosEntrega.length > 0) || (conflitosRetirada && conflitosRetirada.length > 0)) {
        const confirmar = window.confirm("Já existe outra entrega ou retirada agendada para este mesmo horário exato. Deseja continuar mesmo assim?")
        if (!confirmar) {
          setLoading(false)
          return
        }
      }

      // Validar disponibilidade de estoque no periodo

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

      // Checar contra o estoque total de cada item selecionado (Trava Desativada Temporariamente)
      /*
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
      */

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
          cidade: form.cidade,
          data_entrega: dataEntrega.toISOString(),
          data_retirada: dataRetirada.toISOString(),
          status: "agendada",
          observacoes: form.observacoes || null,
          valor_frete: frete,
          valor_total: total,
          pago: form.pago,
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
        cidade: "São Carlos",
        dataEntrega: "",
        horaEntrega: "",
        dataRetirada: "",
        horaRetirada: "",
        observacoes: "",
        frete: "10.00",
        pago: false,
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
            <div className="grid gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-6">
                <div className="flex justify-between items-center"><Label htmlFor="endereco">Rua, Bairro</Label><div className="flex gap-2"><Button type="button" variant="ghost" size="icon" className={`h-6 w-6 ${isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} onClick={startListening} title="Ditar endereço"><Mic className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.endereco}, ${form.numero || ""}, ${form.cidade || ""}, SP, Brasil`)}`, "_blank")} title="Verificar no Maps"><MapPin className="h-4 w-4" /></Button></div></div>
                <Input
                  id="endereco"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua das Flores, 123, Centro"
                  list="sugestoes-rua"
                  required
                />
                <datalist id="sugestoes-rua">
                  <option value="Rua " />
                  <option value="Avenida " />
                  <option value="Centro, São Carlos" />
                  <option value="Broa, Itirapina" />
                  <option value="Vila Nery, São Carlos" />
                  <option value="Cidade Aracy, São Carlos" />
                  <option value="Santa Felícia, São Carlos" />
                </datalist>
              </div>
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="S/N"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  placeholder="São Carlos"
                  required
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
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={addKitJogo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Kit Jogo (1 Mesa + 4 Cad.)
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
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
                          className="h-9 rounded-none text-center bg-white dark:bg-zinc-800 text-black dark:text-white font-bold text-lg w-full border-x-0"
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
            {renderResumoItens()}
          </div>

          {/* Valores e Pagamento */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium">Valores e Pagamento</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <div className="text-lg font-semibold">
                  R$ {subtotal.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frete">Frete (R$)</Label>
                <Input
                  id="frete"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.frete}
                  onChange={(e) => setForm({ ...form, frete: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label>Total da Locação</Label>
                <div className="text-2xl font-bold text-primary">
                  R$ {total.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pago"
                  checked={form.pago}
                  onChange={(e) => setForm({ ...form, pago: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="pago" className="text-base cursor-pointer">
                  Pedido Pago
                </Label>
              </div>
            </div>
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
