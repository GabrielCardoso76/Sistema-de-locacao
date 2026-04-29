"use client"

import { useEffect, useRef } from "react"
import type { Entrega } from "@/lib/database.types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapaEntregasProps {
  entregas: Entrega[]
  selectedEntrega: Entrega | null
  onSelectEntrega: (entrega: Entrega) => void
}

// Icone customizado roxo
const createIcon = (isSelected: boolean, numero: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${isSelected ? "#7c3aed" : "#a78bfa"};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${numero}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export default function MapaEntregas({ entregas, selectedEntrega, onSelectEntrega }: MapaEntregasProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Inicializar mapa (centrado no Brasil)
    mapRef.current = L.map(mapContainerRef.current).setView([-23.55, -46.63], 11)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Limpar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Adicionar novos marcadores
    const bounds: [number, number][] = []

    entregas.forEach((entrega, index) => {
      if (entrega.latitude && entrega.longitude) {
        const lat = parseFloat(entrega.latitude.toString())
        const lng = parseFloat(entrega.longitude.toString())
        
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.push([lat, lng])
          
          const marker = L.marker([lat, lng], {
            icon: createIcon(selectedEntrega?.id === entrega.id, index + 1),
          })
            .addTo(mapRef.current!)
            .on("click", () => onSelectEntrega(entrega))

          // Popup com info basica
          marker.bindPopup(`
            <div style="min-width: 150px;">
              <strong>${entrega.cliente?.nome || "Cliente"}</strong><br/>
              <span style="color: #666; font-size: 12px;">
                ${entrega.endereco}${entrega.numero ? `, ${entrega.numero}` : ''}
              </span>
            </div>
          `)

          markersRef.current.push(marker)
        }
      }
    })

    // Ajustar zoom para mostrar todos os marcadores
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [entregas, selectedEntrega, onSelectEntrega])

  // Centralizar no marcador selecionado
  useEffect(() => {
    if (!mapRef.current || !selectedEntrega) return

    if (selectedEntrega.latitude && selectedEntrega.longitude) {
      const lat = parseFloat(selectedEntrega.latitude.toString())
      const lng = parseFloat(selectedEntrega.longitude.toString())
      
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 15, { animate: true })
      }
    }
  }, [selectedEntrega])

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  )
}
