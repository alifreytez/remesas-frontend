#!/bin/bash

# Obtener la ruta absoluta del directorio donde se encuentra este script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Definir el puerto que se usa para el dev server (según el package.json)
PORT=5000

# Verificar si el servicio ya está escuchando en el puerto 5000 usando /dev/tcp nativo de bash
if (echo > /dev/tcp/localhost/$PORT) 2>/dev/null; then
    echo "✅ El servicio de frontend ya está en ejecución en el puerto $PORT."
    echo "No se creará una doble instancia."
else
    echo "🚀 El servicio no está activo. Iniciando 'yarn dev' en segundo plano con tmux..."
    tmux new-session -d -s frontend_dev 'yarn dev'
    echo "💡 Puedes ver la terminal del servicio usando el comando: tmux attach -t frontend_dev"
fi
