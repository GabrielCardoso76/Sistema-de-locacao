"use client"

import { Phone, MapPin, Calendar, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Entrega, StatusEntrega } from "@/lib/database.types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DetalhesEntregaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entrega: Entrega | null
  onSuccess: () => void
}

export function DetalhesEntregaDialog({
  open,
  onOpenChange,
  entrega,
  onSuccess,
}: DetalhesEntregaDialogProps) {
  if (!entrega) return null

  async function updateStatus(newStatus: StatusEntrega) {
    await supabase
      .from("entregas")
      .update({ status: newStatus })
      .eq("id", entrega!.id)
    onSuccess()
  }

  function formatPhone(phone: string) {
    return phone.replace(/\D/g, "")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={entrega.status}
              onValueChange={(value) => updateStatus(value as StatusEntrega)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_rota">Em Rota</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="retirada">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="font-medium">Cliente</h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{entrega.cliente?.nome}</p>
              <a
                href={`tel:${formatPhone(entrega.cliente?.telefone || "")}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {entrega.cliente?.telefone}
              </a>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>
            <p>{entrega.endereco}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const encoded = encodeURIComponent(entrega.endereco)
                window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank")
              }}
            >
              Abrir no Google Maps
            </Button>
          </div>

          {/* Datas */}
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Entrega</p>
                <p className="font-medium">
                  {format(parseISO(entrega.data_entrega), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retirada</p>
                <p className="font-medium">
                  {format(parseISO(entrega.data_retirada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Itens */}
          {entrega.itens && entrega.itens.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Itens
              </h3>
              <div className="space-y-2">
                {entrega.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.produto?.nome}</span>
                    <Badge variant="secondary">{item.quantidade}x</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {entrega.observacoes && (
            <div className="space-y-2 rounded-lg border p-4">
              <h3 className="font-medium">Observações</h3>
              <p className="text-muted-foreground">{entrega.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
