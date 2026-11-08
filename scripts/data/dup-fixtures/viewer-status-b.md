# Viewer Status Probe (Variante B)

Es gibt KEIN `/api/health` am memo-viewer — dieser Endpoint existiert nicht. Nutze
stattdessen `curl http://localhost:3333/api/documents`, um zu pruefen ob der Server
antwortet; die Dokumentliste kommt als JSON zurueck.
