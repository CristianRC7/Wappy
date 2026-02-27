#!/bin/bash

# ============================================================
#                        Wappy
#              Author: Cristian Ramirez
# ============================================================

# Colores para la terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Directorio raiz del script (donde esta ubicado wappy.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ============================================================
# MENU PRINCIPAL
# ============================================================
mostrar_menu() {
    clear
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}                           Wappy                           ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    echo "  [1] Instalar/Verificar Requerimientos"
    echo "  [2] Iniciar Servicios"
    echo "  [3] Apagar Servicios"
    echo "  [4] Salir"
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}               Author: Cristian Ramirez                    ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    read -p "Seleccione una opcion (1-4): " opcion

    case "$opcion" in
        1) instalar ;;
        2) iniciar ;;
        3) apagar ;;
        4) salir ;;
        *)
            echo ""
            echo "Opcion no valida. Presione Enter para continuar..."
            read
            mostrar_menu
            ;;
    esac
}

# ============================================================
# INSTALAR / VERIFICAR REQUERIMIENTOS
# ============================================================
instalar() {
    clear
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}       INSTALANDO/VERIFICANDO REQUERIMIENTOS                ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""

    # [1/4] Verificar carpetas
    echo "[1/4] Verificando carpetas del proyecto..."
    if [ ! -d "$SCRIPT_DIR/server" ]; then
        echo -e "${RED}[X] Error: No se encontro la carpeta 'server'${RESET}"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi
    if [ ! -d "$SCRIPT_DIR/frontend" ]; then
        echo -e "${RED}[X] Error: No se encontro la carpeta 'frontend'${RESET}"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi
    echo -e "${GREEN}[OK] Carpetas encontradas.${RESET}"

    # [2/4] Verificar .env del Backend
    echo ""
    echo "==========================================================="
    echo "[2/4] Verificando archivo .env del Backend..."
    echo "==========================================================="
    if [ -f "$SCRIPT_DIR/server/.env" ]; then
        echo -e "${GREEN}[OK] server/.env ya existe. No se realizaron cambios.${RESET}"
    else
        echo -e "${YELLOW}[INFO] server/.env no encontrado. Creando...${RESET}"
        if [ -f "$SCRIPT_DIR/server/.env.example" ]; then
            cp "$SCRIPT_DIR/server/.env.example" "$SCRIPT_DIR/server/.env"
            echo -e "${GREEN}[OK] server/.env creado desde .env.example${RESET}"
        else
            echo -e "${YELLOW}[INFO] .env.example no encontrado. Generando con valores por defecto...${RESET}"
            cat > "$SCRIPT_DIR/server/.env" <<EOF
# Port where the server will run
PORT=3005
# Allowed CORS origin
CORS_ORIGIN=http://localhost:5173
EOF
            echo -e "${GREEN}[OK] server/.env creado con valores por defecto.${RESET}"
        fi
    fi

    # [3/4] Verificar .env del Frontend
    echo ""
    echo "==========================================================="
    echo "[3/4] Verificando archivo .env del Frontend..."
    echo "==========================================================="
    if [ -f "$SCRIPT_DIR/frontend/.env" ]; then
        echo -e "${GREEN}[OK] frontend/.env ya existe. No se realizaron cambios.${RESET}"
    else
        echo -e "${YELLOW}[INFO] frontend/.env no encontrado. Creando...${RESET}"
        if [ -f "$SCRIPT_DIR/frontend/.env.example" ]; then
            cp "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env"
            echo -e "${GREEN}[OK] frontend/.env creado desde .env.example${RESET}"
        else
            echo -e "${YELLOW}[INFO] .env.example no encontrado. Generando con valores por defecto...${RESET}"
            cat > "$SCRIPT_DIR/frontend/.env" <<EOF
# Example environment variables for Vite frontend
VITE_API_URL=http://localhost:3005
EOF
            echo -e "${GREEN}[OK] frontend/.env creado con valores por defecto.${RESET}"
        fi
    fi

    # [4/4] Instalar dependencias
    echo ""
    echo "==========================================================="
    echo "[4/4] Instalando dependencias de Node.js..."
    echo "==========================================================="
    echo ""
    echo "--- Backend ---"
    cd "$SCRIPT_DIR/server"
    if [ ! -d "node_modules" ]; then
        echo "Instalando paquetes del backend por primera vez..."
    else
        echo "node_modules encontrado. Verificando actualizaciones..."
    fi
    npm install
    cd "$SCRIPT_DIR"

    echo ""
    echo "--- Frontend ---"
    cd "$SCRIPT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        echo "Instalando paquetes del frontend por primera vez..."
    else
        echo "node_modules encontrado. Verificando actualizaciones..."
    fi
    npm install
    cd "$SCRIPT_DIR"

    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}[OK] Todos los requerimientos verificados correctamente${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    echo "  - Carpetas del proyecto : OK"
    echo "  - server/.env           : OK"
    echo "  - frontend/.env         : OK"
    echo "  - Dependencias backend  : OK"
    echo "  - Dependencias frontend : OK"
    echo ""
    read -p "Presione Enter para volver al menu..."
    mostrar_menu
}

# ============================================================
# INICIAR SERVICIOS
# ============================================================
iniciar() {
    clear
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}          INICIANDO SERVICIOS                               ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""

    echo "Verificando carpetas..."
    if [ ! -d "$SCRIPT_DIR/server" ]; then
        echo -e "${RED}[X] Error: No se encontro la carpeta 'server'${RESET}"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi
    if [ ! -d "$SCRIPT_DIR/frontend" ]; then
        echo -e "${RED}[X] Error: No se encontro la carpeta 'frontend'${RESET}"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi

    echo "Verificando node_modules..."
    if [ ! -d "$SCRIPT_DIR/server/node_modules" ]; then
        echo -e "${RED}[X] Error: No se encontraron las dependencias del backend${RESET}"
        echo "   Ejecute primero la opcion [1] para instalar requerimientos"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi
    if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
        echo -e "${RED}[X] Error: No se encontraron las dependencias del frontend${RESET}"
        echo "   Ejecute primero la opcion [1] para instalar requerimientos"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi

    echo "Verificando archivos .env..."
    if [ ! -f "$SCRIPT_DIR/server/.env" ]; then
        echo -e "${RED}[X] Error: No se encontro server/.env${RESET}"
        echo "   Ejecute primero la opcion [1] para instalar requerimientos"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi
    if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
        echo -e "${RED}[X] Error: No se encontro frontend/.env${RESET}"
        echo "   Ejecute primero la opcion [1] para instalar requerimientos"
        read -p "Presione Enter para volver al menu..."
        mostrar_menu
        return
    fi

    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo "Iniciando Backend (Node.js)..."
    echo -e "${GREEN}============================================================${RESET}"
    # Abrir nueva ventana de Terminal para el backend
    osascript -e "tell application \"Terminal\"
        do script \"cd '$SCRIPT_DIR/server' && node index.js\"
        set custom title of front window to \"Backend - WhatsApp Server\"
    end tell"

    sleep 2

    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo "Iniciando Frontend (Electron)..."
    echo -e "${GREEN}============================================================${RESET}"
    # Abrir nueva ventana de Terminal para el frontend
    osascript -e "tell application \"Terminal\"
        do script \"cd '$SCRIPT_DIR/frontend' && npm run electron:dev\"
        set custom title of front window to \"Frontend - WhatsApp Client\"
    end tell"

    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}[OK] Servicios iniciados correctamente${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    echo "Se han abierto 2 ventanas de Terminal:"
    echo "   - Backend (puerto por defecto del servidor)"
    echo "   - Frontend (Electron dev)"
    echo ""
    echo -e "${YELLOW}IMPORTANTE: No cierre estas ventanas mientras use la aplicacion${RESET}"
    echo ""
    read -p "Presione Enter para volver al menu..."
    mostrar_menu
}

# ============================================================
# APAGAR SERVICIOS
# ============================================================
apagar() {
    clear
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}          APAGANDO SERVICIOS                                ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""

    echo "Buscando procesos activos..."
    echo ""

    # Cerrar proceso del backend (node index.js)
    BACKEND_PID=$(pgrep -f "node index.js" 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        kill -9 $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}[OK] Backend cerrado correctamente (PID: $BACKEND_PID)${RESET}"
    else
        echo -e "${YELLOW}[INFO] Backend no estaba corriendo${RESET}"
    fi

    # Cerrar proceso de Electron
    ELECTRON_PID=$(pgrep -f "Electron" 2>/dev/null)
    if [ -n "$ELECTRON_PID" ]; then
        kill -9 $ELECTRON_PID 2>/dev/null
        echo -e "${GREEN}[OK] Electron cerrado correctamente (PID: $ELECTRON_PID)${RESET}"
    else
        echo -e "${YELLOW}[INFO] Electron no estaba corriendo${RESET}"
    fi

    # Cerrar proceso de Vite dev server (npm run electron:dev)
    VITE_PID=$(pgrep -f "vite" 2>/dev/null)
    if [ -n "$VITE_PID" ]; then
        kill -9 $VITE_PID 2>/dev/null
        echo -e "${GREEN}[OK] Vite dev server cerrado correctamente (PID: $VITE_PID)${RESET}"
    else
        echo -e "${YELLOW}[INFO] Vite no estaba corriendo${RESET}"
    fi

    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}[OK] Proceso completado${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    echo "Servicios detenidos:"
    echo "   - Backend (Node.js) - si estaba corriendo"
    echo "   - Frontend (Electron) - si estaba corriendo"
    echo "   - Vite Dev Server - si estaba corriendo"
    echo ""
    echo "Este gestor permanece abierto para seguir trabajando."
    echo ""
    read -p "Presione Enter para volver al menu..."
    mostrar_menu
}

# ============================================================
# SALIR
# ============================================================
salir() {
    clear
    echo ""
    echo -e "${GREEN}============================================================${RESET}"
    echo -e "${GREEN}   Gracias por usar Wappy, Hasta luego!                     ${RESET}"
    echo -e "${GREEN}============================================================${RESET}"
    echo ""
    sleep 2
    exit 0
}

# ============================================================
# INICIO
# ============================================================
mostrar_menu
