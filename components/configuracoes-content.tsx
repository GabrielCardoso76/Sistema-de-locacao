"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUiScale } from "@/components/ui-scale-provider"
import { ZoomIn, ZoomOut, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ConfiguracoesContent() {
  const { scale, setScale } = useUiScale()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const increaseScale = () => setScale(Math.min(scale + 1, 24))
  const decreaseScale = () => setScale(Math.max(scale - 1, 12))
  const resetScale = () => setScale(16)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Acessibilidade e Visualização
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho da interface e dos textos de acordo com sua preferência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium">Tamanho da Fonte</h3>
              <p className="text-sm text-muted-foreground">
                Atual: {scale}px
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseScale}
                disabled={scale <= 12}
              >
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Diminuir</span>
              </Button>
              <Button
                variant="outline"
                className="w-24"
                onClick={resetScale}
              >
                Padrão
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseScale}
                disabled={scale >= 24}
              >
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Aumentar</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t">
            <div className="flex-1">
              <h3 className="text-sm font-medium">Tema Visual</h3>
              <p className="text-sm text-muted-foreground">
                Alternar entre os modos Claro e Escuro
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="w-24"
                disabled={!mounted}
              >
                <Sun className="mr-2 h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="w-24"
                disabled={!mounted}
              >
                <Moon className="mr-2 h-4 w-4" />
                Escuro
              </Button>
            </div>
          </div>

          {/* Visualização de exemplo */}
          <div className="rounded-lg border p-4 bg-muted/50 mt-4">
            <p className="text-sm font-medium mb-2">Exemplo de visualização</p>
            <div className="space-y-2">
              <h4 className="text-lg font-bold">Título de Exemplo</h4>
              <p className="text-base text-muted-foreground">
                Este é um parágrafo de exemplo para mostrar como o texto e os elementos da interface irão se comportar com as suas configurações de escala.
              </p>
              <div className="flex gap-2">
                <Button size="sm">Botão Exemplo</Button>
                <Button variant="outline" size="sm">Outro Botão</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
