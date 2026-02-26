@echo off
color 0A
title Wappy - Cristian Ramirez

:MENU
cls
echo ============================================================
echo                            Wappy                        
echo ============================================================
echo.
echo  [1] Instalar/Verificar Requerimientos
echo  [2] Iniciar Servicios
echo  [3] Apagar Servicios
echo  [4] Salir
echo ============================================================
echo                Author: Cristian Ramirez
echo ============================================================
echo.
set /p opcion="Seleccione una opcion (1-4): "

if "%opcion%"=="1" goto INSTALAR
if "%opcion%"=="2" goto INICIAR
if "%opcion%"=="3" goto APAGAR
if "%opcion%"=="4" goto SALIR
echo.
echo Opcion no valida. Presione cualquier tecla para continuar...
pause >nul
goto MENU

:INSTALAR
cls
echo ============================================================
echo        INSTALANDO/VERIFICANDO REQUERIMIENTOS               
echo ============================================================
echo.

echo [1/4] Verificando carpetas del proyecto...
if not exist "server" (
    echo [X] Error: No se encontro la carpeta 'server'
    pause
    goto MENU
)
if not exist "frontend" (
    echo [X] Error: No se encontro la carpeta 'frontend'
    pause
    goto MENU
)
echo [OK] Carpetas encontradas.

echo.
echo ===========================================================
echo [2/4] Verificando archivo .env del Backend...
echo ===========================================================
if exist "server\.env" (
    echo [OK] server\.env ya existe. No se realizaron cambios.
) else (
    echo [INFO] server\.env no encontrado. Creando...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo [OK] server\.env creado desde .env.example
    ) else (
        echo [INFO] .env.example no encontrado. Generando con valores por defecto...
        (
            echo # Port where the server will run
            echo PORT=3005
            echo # Allowed CORS origin
            echo CORS_ORIGIN=http://localhost:5173
        ) > "server\.env"
        echo [OK] server\.env creado con valores por defecto.
    )
)

echo.
echo ===========================================================
echo [3/4] Verificando archivo .env del Frontend...
echo ===========================================================
if exist "frontend\.env" (
    echo [OK] frontend\.env ya existe. No se realizaron cambios.
) else (
    echo [INFO] frontend\.env no encontrado. Creando...
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo [OK] frontend\.env creado desde .env.example
    ) else (
        echo [INFO] .env.example no encontrado. Generando con valores por defecto...
        (
            echo # Example environment variables for Vite frontend
            echo VITE_API_URL=http://localhost:3005
        ) > "frontend\.env"
        echo [OK] frontend\.env creado con valores por defecto.
    )
)

echo.
echo ===========================================================
echo [4/4] Instalando dependencias de Node.js...
echo ===========================================================
echo.
echo --- Backend ---
cd server
if not exist "node_modules" (
    echo Instalando paquetes del backend por primera vez...
) else (
    echo node_modules encontrado. Verificando actualizaciones...
)
call npm install
cd ..

echo.
echo --- Frontend ---
cd frontend
if not exist "node_modules" (
    echo Instalando paquetes del frontend por primera vez...
) else (
    echo node_modules encontrado. Verificando actualizaciones...
)
call npm install
cd ..

echo.
echo ============================================================
echo [OK] Todos los requerimientos verificados correctamente
echo ============================================================
echo.
echo   - Carpetas del proyecto : OK
echo   - server\.env           : OK
echo   - frontend\.env         : OK
echo   - Dependencias backend  : OK
echo   - Dependencias frontend : OK
echo.
pause
goto MENU

:INICIAR
cls
echo ============================================================
echo          INICIANDO SERVICIOS                                
echo ============================================================
echo.

echo Verificando carpetas...
if not exist "server" (
    echo [X] Error: No se encontro la carpeta 'server'
    pause
    goto MENU
)

if not exist "frontend" (
    echo [X] Error: No se encontro la carpeta 'frontend'
    pause
    goto MENU
)

echo Verificando node_modules...
if not exist "server\node_modules" (
    echo [X] Error: No se encontraron las dependencias del backend
    echo    Ejecute primero la opcion [1] para instalar requerimientos
    pause
    goto MENU
)

if not exist "frontend\node_modules" (
    echo [X] Error: No se encontraron las dependencias del frontend
    echo    Ejecute primero la opcion [1] para instalar requerimientos
    pause
    goto MENU
)

echo Verificando archivos .env...
if not exist "server\.env" (
    echo [X] Error: No se encontro server\.env
    echo    Ejecute primero la opcion [1] para instalar requerimientos
    pause
    goto MENU
)

if not exist "frontend\.env" (
    echo [X] Error: No se encontro frontend\.env
    echo    Ejecute primero la opcion [1] para instalar requerimientos
    pause
    goto MENU
)

echo.
echo ============================================================
echo Iniciando Backend (Node.js)...
echo ============================================================
start "Backend - WhatsApp Server" cmd /k "cd /d %~dp0server && node index.js"

timeout /t 2 >nul

echo.
echo ============================================================
echo Iniciando Frontend (Vite)...
echo ============================================================
start "Frontend - WhatsApp Client" cmd /k "cd /d %~dp0frontend && npm run electron:dev"

echo.
echo ============================================================
echo [OK] Servicios iniciados correctamente
echo ============================================================
echo.
echo Se han abierto 2 ventanas:
echo    - Backend (puerto por defecto del servidor)
echo    - Frontend (Vite dev server)
echo.
echo IMPORTANTE: No cierre estas ventanas mientras use la aplicacion
echo.
pause
goto MENU

:APAGAR
cls
echo ============================================================
echo          APAGANDO SERVICIOS                                
echo ============================================================
echo.

echo Buscando procesos activos...
echo.

REM Cerrar ventana especifica del Backend usando su titulo
taskkill /FI "WINDOWTITLE eq Backend - WhatsApp Server*" /F >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Backend cerrado correctamente
) else (
    echo [INFO] Backend no estaba corriendo
)

REM Cerrar ventana especifica del Frontend usando su titulo
taskkill /FI "WINDOWTITLE eq Frontend - WhatsApp Client*" /F >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Frontend cerrado correctamente
) else (
    echo [INFO] Frontend no estaba corriendo
)

REM Cerrar proceso Electron si esta corriendo
taskkill /IM electron.exe /F >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Electron cerrado correctamente
) else (
    echo [INFO] Electron no estaba corriendo
)

echo.
echo ============================================================
echo [OK] Proceso completado
echo ============================================================
echo.
echo Servicios detenidos:
echo    - Backend (Node.js) - si estaba corriendo
echo    - Frontend (Electron) - si estaba corriendo
echo.
echo Este gestor permanece abierto para seguir trabajando.
echo.
pause
goto MENU

:SALIR
cls
echo.
echo ============================================================
echo Gracias por usar Wappy, Hasta luego!
echo ============================================================
echo.
timeout /t 4 >nul
exit
