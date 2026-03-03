'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProject {
    id: string; name: string; progress: number; status: string; lat: number; lng: number
    [key: string]: unknown
}

export default function ProjectMap({ projects, onSelect }: { projects: MapProject[], onSelect: (p: MapProject) => void }) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<L.Map | null>(null)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Detect theme
        const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
        checkTheme()
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!mapRef.current) return

        // Clean up previous instance
        if (mapInstance.current) {
            mapInstance.current.remove()
            mapInstance.current = null
        }

        mapInstance.current = L.map(mapRef.current, {
            center: [-12.0464, -77.0428],
            zoom: 13,
            zoomControl: false,
        })

        L.control.zoom({ position: 'topright' }).addTo(mapInstance.current)

        // Auto light/dark tile layer
        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19,
        }).addTo(mapInstance.current)

        return () => { mapInstance.current?.remove(); mapInstance.current = null }
    }, [isDark])

    useEffect(() => {
        if (!mapInstance.current) return

        // Clear old markers
        mapInstance.current.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) mapInstance.current?.removeLayer(layer)
        })

        projects.forEach(project => {
            if (!project.lat || !project.lng) return

            const color = project.progress >= 80 ? '#22c55e' : project.progress >= 50 ? '#1AA3D9' : project.progress >= 25 ? '#F6AD27' : '#B234BD'

            const marker = L.circleMarker([project.lat, project.lng], {
                radius: 10,
                fillColor: color,
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85,
            }).addTo(mapInstance.current!)

            const tooltipBg = isDark ? 'rgba(14, 14, 18, 0.9)' : 'rgba(255, 255, 255, 0.95)'
            const tooltipColor = isDark ? 'white' : '#1a1a2e'
            const subColor = isDark ? '#999' : '#666'

            marker.bindTooltip(`<div style="font-size:12px;font-weight:600;color:${tooltipColor}">${project.name}</div><div style="font-size:11px;color:${subColor}">${project.progress}% completado</div>`, {
                direction: 'top',
                offset: [0, -12],
                className: isDark ? 'map-tooltip-dark' : 'map-tooltip-light',
            })

            marker.on('click', () => onSelect(project))
        })
    }, [projects, onSelect, isDark])

    return (
        <>
            <style jsx global>{`
        .map-tooltip-dark {
          background: rgba(14, 14, 18, 0.95) !important;
          border: 1px solid rgba(178, 52, 189, 0.3) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        }
        .map-tooltip-dark::before { border-top-color: rgba(14, 14, 18, 0.95) !important; }
        .map-tooltip-light {
          background: rgba(255, 255, 255, 0.97) !important;
          border: 1px solid rgba(178, 52, 189, 0.2) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
        }
        .map-tooltip-light::before { border-top-color: rgba(255, 255, 255, 0.97) !important; }
        .leaflet-container { background: transparent !important; border-radius: 12px; }
      `}</style>
            <div ref={mapRef} className="w-full h-full rounded-xl" />
        </>
    )
}
