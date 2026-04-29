"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Entrega } from "@/lib/database.types"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function CalendarioContent() {
  const [date, setDate] = useState<Date>(new Date())
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtro, setFiltro] = useState<"todos" | "entregas" | "retiradas">("todos")

  // Load deliveries for the entire current month
  useEffect(() => {
    async function loadMes() {
      setLoading(true)
      const start = startOfMonth(date).toISOString()
      const end = endOfMonth(date).toISOString()

      const { data } = await supabase
        .from("entregas")
        .select("*, cliente:clientes(*), itens:itens_entrega(*, produto:produtos(*))")
        .or(`data_entrega.gte.${start},data_retirada.gte.${start}`)
        .or(`data_entrega.lte.${end},data_retirada.lte.${end}`)

      if (data) {
        setEntregas(data)
      }
      setLoading(false)
    }

    loadMes()
  }, [date])

  // Process data for rendering dots
  const dayEvents = new Map<string, { entregas: Entrega[], retiradas: Entrega[] }>()
  entregas.forEach(e => {
    const dEntrega = format(parseISO(e.data_entrega), "yyyy-MM-dd")
    const dRetirada = format(parseISO(e.data_retirada), "yyyy-MM-dd")

    if (!dayEvents.has(dEntrega)) dayEvents.set(dEntrega, { entregas: [], retiradas: [] })
    dayEvents.get(dEntrega)!.entregas.push(e)

    if (!dayEvents.has(dRetirada)) dayEvents.set(dRetirada, { entregas: [], retiradas: [] })
    dayEvents.get(dRetirada)!.retiradas.push(e)
  })

  // Selected day items
  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""
  const selectedEvents = dayEvents.get(selectedDayKey) || { entregas: [], retiradas: [] }

  const handleDayClick = (d: Date | undefined) => {
    if (d) {
      setDate(d)
      setSelectedDay(d)
      setDialogOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 max-w-sm mx-auto">
              <Calendar
                mode="single"
                month={date}
                selected={date}
                onMonthChange={setDate}
                onSelect={handleDayClick}
                className="rounded-md border p-4 shadow-sm w-full"
                modifiers={{
                  hasEntregas: (d) => {
                    const k = format(d, "yyyy-MM-dd");
                    return (dayEvents.get(k)?.entregas?.length || 0) > 0;
                  },
                  hasRetiradas: (d) => {
                    const k = format(d, "yyyy-MM-dd");
                    return (dayEvents.get(k)?.retiradas?.length || 0) > 0;
                  }
                }}
                modifiersClassNames={{
                  hasEntregas: "bg-blue-100 dark:bg-blue-900/30 font-bold",
                  hasRetiradas: "bg-orange-100 dark:bg-orange-900/30 font-bold"
                }}
                components={{
                  DayButton: (props: any) => {
                    const { day, modifiers, ...buttonProps } = props;
                    const dateObj = day.date;
                    if (!dateObj) return <div />;
                    const k = format(dateObj, "yyyy-MM-dd");
                    const ev = dayEvents.get(k);

                    return (
                      <button
                        {...buttonProps}
                        className={`flex flex-col items-center justify-center relative w-full h-full text-sm font-normal rounded-md cursor-pointer hover:bg-muted ${modifiers.selected ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""} ${modifiers.outside ? "text-muted-foreground opacity-50" : ""}`}
                        onClick={() => handleDayClick(dateObj)}
                      >
                        <span>{format(dateObj, "d")}</span>
                        <div className="flex gap-1 mt-1 absolute bottom-1">
                          {ev?.entregas.length ? <div className="h-1 w-1 rounded-full bg-blue-500" /> : null}
                          {ev?.retiradas.length ? <div className="h-1 w-1 rounded-full bg-orange-500" /> : null}
                        </div>
                      </button>
                    )
                  }
                }}
              />
              <div className="flex gap-4 justify-center mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Entregas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>Retiradas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Badge
              variant={filtro === "todos" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFiltro("todos")}
            >
              Todos
            </Badge>
            <Badge
              variant={filtro === "entregas" ? "default" : "outline"}
              className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 border-blue-200"
              onClick={() => setFiltro("entregas")}
            >
              Apenas Entregas
            </Badge>
            <Badge
              variant={filtro === "retiradas" ? "default" : "outline"}
              className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 border-orange-200"
              onClick={() => setFiltro("retiradas")}
            >
              Apenas Retiradas
            </Badge>
          </div>

          <div className="space-y-6">
            {(filtro === "todos" || filtro === "entregas") && (
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Entregas ({selectedEvents.entregas.length})
                </h3>
                {selectedEvents.entregas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma entrega agendada para este dia.</p>
                ) : (
                  <div className="grid gap-3">
                    {selectedEvents.entregas.map((entrega) => (
                      <div key={entrega.id} className="border rounded-md p-3 text-sm">
                        <div className="flex justify-between font-medium">
                          <span>{entrega.cliente?.nome}</span>
                          <span>{format(parseISO(entrega.data_entrega), "HH:mm")}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {entrega.endereco}{entrega.numero ? `, ${entrega.numero}` : ''}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entrega.itens?.map((item) => (
                            <Badge key={item.id} variant="secondary" className="text-[10px]">
                              {item.quantidade}x {item.produto?.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(filtro === "todos" || filtro === "retiradas") && (
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Retiradas ({selectedEvents.retiradas.length})
                </h3>
                {selectedEvents.retiradas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma retirada agendada para este dia.</p>
                ) : (
                  <div className="grid gap-3">
                    {selectedEvents.retiradas.map((entrega) => (
                      <div key={entrega.id} className="border rounded-md p-3 text-sm">
                        <div className="flex justify-between font-medium">
                          <span>{entrega.cliente?.nome}</span>
                          <span>{format(parseISO(entrega.data_retirada), "HH:mm")}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {entrega.endereco}{entrega.numero ? `, ${entrega.numero}` : ''}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entrega.itens?.map((item) => (
                            <Badge key={item.id} variant="secondary" className="text-[10px]">
                              {item.quantidade}x {item.produto?.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
