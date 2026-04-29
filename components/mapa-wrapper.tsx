"use client"

import dynamic from "next/dynamic"
import type { Entrega } from "@/lib/database.types"

const MapaEntregas = dynamic(() => import("./mapa-entregas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full min-h-[400px] sm:h-full items-center justify-center rounded-lg bg-muted">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  ),
})

interface MapaWrapperProps {
  entregas: Entrega[]
  selectedEntrega: Entrega | null
  onSelectEntrega: (entrega: Entrega) => void
}

export function MapaWrapper({ entregas, selectedEntrega, onSelectEntrega }: MapaWrapperProps) {
  return (
    <MapaEntregas
      entregas={entregas}
      selectedEntrega={selectedEntrega}
      onSelectEntrega={onSelectEntrega}
    />
  )
}
