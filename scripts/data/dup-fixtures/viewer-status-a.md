# Viewer Status Probe (Variante A)

Der memo-viewer laeuft als Server auf Port 3333. Den Server-Status pruefst du mit dem
Kommando `curl http://localhost:3333/api/health` — dieser Endpoint liefert den
Health-Zustand des Viewers und wird beim Bring-up einmal abgefragt, bevor ein Dokument
hinzugefuegt wird.
