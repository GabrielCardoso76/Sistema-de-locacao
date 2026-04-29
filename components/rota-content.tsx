"use client"

import { useEffect, useState, useCallback } from "react"
import { MapPin, Navigation, Phone, Package, GripVertical, Play, CheckCircle, Map } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Entrega, Cliente, ItemEntrega, Produto } from "@/lib/database.types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MapaWrapper } from "./mapa-wrapper"

export function RotaContent() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null)
  const [rotaIniciada, setRotaIniciada] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showMap, setShowMap] = useState(true)

  // Funcao para geocodificar endereco
  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
    } catch (error) {
      console.error("Erro ao geocodificar:", error)
    }
    return null
  }

  async function loadEntregas() {
    setLoading(true)
    const inicioHoje = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString()
    const fimHoje = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1).toISOString()

    const { data } = await supabase
      .from("entregas")
      .select("*, cliente:clientes(*), itens:itens_entrega(*, produto:produtos(*))")
      .gte("data_entrega", inicioHoje)
      .lt("data_entrega", fimHoje)
      .in("status", ["agendada", "em_rota"])
      .order("ordem_rota", { ascending: true, nullsFirst: false })
      .order("data_entrega", { ascending: true })

    // Geocodificar entregas que nao tem coordenadas
    const entregasComCoordenadas = await Promise.all(
      (data || []).map(async (entrega) => {
        if (!entrega.latitude || !entrega.longitude) {
          const enderecoCompleto = entrega.numero 
            ? `${entrega.endereco}, ${entrega.numero}`
            : entrega.endereco

          const coords = await geocodeAddress(enderecoCompleto)
          if (coords) {
            // Atualizar no banco
            await supabase
              .from("entregas")
              .update({ latitude: coords.lat, longitude: coords.lng })
              .eq("id", entrega.id)
            return { ...entrega, latitude: coords.lat, longitude: coords.lng }
          }
        }
        return entrega
      })
    )

    setEntregas(entregasComCoordenadas)
    setLoading(false)
  }

  useEffect(() => {
    loadEntregas()
  }, [selectedDate])

  const handleSelectEntrega = useCallback((entrega: Entrega) => {
    setSelectedEntrega(entrega)
  }, [])

  async function iniciarRota() {
    for (let i = 0; i < entregas.length; i++) {
      await supabase
        .from("entregas")
        .update({ ordem_rota: i + 1, status: "em_rota" })
        .eq("id", entregas[i].id)
    }
    setRotaIniciada(true)
    if (entregas.length > 0) {
      setSelectedEntrega(entregas[0])
    }
    loadEntregas()
  }

  async function marcarEntregue(entregaId: string) {
    await supabase
      .from("entregas")
      .update({ status: "entregue" })
      .eq("id", entregaId)

    const currentIndex = entregas.findIndex((e) => e.id === entregaId)
    const nextEntrega = entregas[currentIndex + 1]
    
    if (nextEntrega) {
      setSelectedEntrega(nextEntrega)
    } else {
      setSelectedEntrega(null)
      setRotaIniciada(false)
    }
    
    loadEntregas()
  }

  async function moverEntrega(fromIndex: number, toIndex: number) {
    const newEntregas = [...entregas]
    const [removed] = newEntregas.splice(fromIndex, 1)
    newEntregas.splice(toIndex, 0, removed)
    setEntregas(newEntregas)

    for (let i = 0; i < newEntregas.length; i++) {
      await supabase
        .from("entregas")
        .update({ ordem_rota: i + 1 })
        .eq("id", newEntregas[i].id)
    }
  }

  function abrirNavegacao(endereco: string, numero?: string | null) {
    const enderecoCompleto = numero 
      ? `${endereco}, ${numero}`
      : endereco
    const encoded = encodeURIComponent(enderecoCompleto)
    window.open(`https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=${encoded}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <p className="text-lg font-medium">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <p className="text-muted-foreground">
            {entregas.length} entrega{entregas.length !== 1 ? "s" : ""} para este dia
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="mr-2 h-4 w-4" />
            {showMap ? "Ocultar Mapa" : "Mostrar Mapa"}
          </Button>
          {entregas.length > 0 && !rotaIniciada && (
            <Button onClick={iniciarRota} size="lg">
              <Play className="mr-2 h-5 w-5" />
              Iniciar Rota
            </Button>
          )}
        </div>
      </div>

      {entregas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Nenhuma entrega para este dia</p>
            <p className="text-muted-foreground">
              As entregas agendadas aparecerao aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Mapa */}
          {showMap && (
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Mapa das Entregas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] lg:h-[500px] relative z-0">
                  <MapaWrapper
                    entregas={entregas}
                    selectedEntrega={selectedEntrega}
                    onSelectEntrega={handleSelectEntrega}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Entregas e Info da Selecionada */}
          <div className={`space-y-4 ${showMap ? "lg:col-span-1" : "lg:col-span-2"}`}>
            {/* Detalhes da Entrega Selecionada */}
            {selectedEntrega && (
              <Card className="border-primary">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Navigation className="h-4 w-4" />
                    {rotaIniciada ? "Proxima Entrega" : "Entrega Selecionada"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {/* Cliente */}
                  <div>
                    <p className="text-lg font-bold">{selectedEntrega.cliente?.nome}</p>
                    <a
                      href={`tel:${selectedEntrega.cliente?.telefone?.replace(/\D/g, "")}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {selectedEntrega.cliente?.telefone}
                    </a>
                  </div>

                  {/* Endereco */}
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        {selectedEntrega.endereco}
                        {selectedEntrega.numero && `, ${selectedEntrega.numero}`}
                      </p>
                    </div>
                  </div>

                  {/* Itens */}
                  {selectedEntrega.itens && selectedEntrega.itens.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Itens
                      </p>
                      <div className="grid gap-1">
                        {selectedEntrega.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded border bg-card px-3 py-2 text-sm"
                          >
                            <span className="truncate">{item.produto?.nome}</span>
                            <Badge variant="secondary" className="font-bold ml-2">
                              {item.quantidade}x
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observacoes */}
                  {selectedEntrega.observacoes && (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
                      <p className="text-xs font-medium text-yellow-700">Observacoes</p>
                      <p className="text-sm">{selectedEntrega.observacoes}</p>
                    </div>
                  )}

                  {/* Acoes */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className="w-full"
                      onClick={() => abrirNavegacao(selectedEntrega.endereco, selectedEntrega.numero)}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Navegar
                    </Button>
                    {rotaIniciada && (
                      <Button
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        onClick={() => marcarEntregue(selectedEntrega.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar Entregue
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Entregas */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Ordem de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {entregas.map((entrega, index) => (
                  <div
                    key={entrega.id}
                    className={`flex items-center gap-2 rounded-lg border p-3 transition-colors cursor-pointer ${
                      selectedEntrega?.id === entrega.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedEntrega(entrega)}
                  >
                    <div className="cursor-grab text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{entrega.cliente?.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(entrega.data_entrega), "HH:mm")}
                      </p>
                    </div>
                    <Badge 
                      variant={entrega.status === "em_rota" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {entrega.status === "em_rota" ? "Em Rota" : "Agendada"}
                    </Badge>
                  </div>
                ))}

                {/* Botoes de reordenacao */}
                {selectedEntrega && entregas.length > 1 && !rotaIniciada && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={entregas.findIndex((e) => e.id === selectedEntrega.id) === 0}
                      onClick={() => {
                        const index = entregas.findIndex((e) => e.id === selectedEntrega.id)
                        if (index > 0) moverEntrega(index, index - 1)
                      }}
                    >
                      Subir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={
                        entregas.findIndex((e) => e.id === selectedEntrega.id) ===
                        entregas.length - 1
                      }
                      onClick={() => {
                        const index = entregas.findIndex((e) => e.id === selectedEntrega.id)
                        if (index < entregas.length - 1) moverEntrega(index, index + 1)
                      }}
                    >
                      Descer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Todas concluidas */}
            {!selectedEntrega && entregas.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
                  <p className="mt-3 font-medium">Todas as entregas concluidas!</p>
                  <p className="text-sm text-muted-foreground">Bom trabalho!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
