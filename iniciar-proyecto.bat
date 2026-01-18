@echo off
color 0A
title Wappy - Cristian Ramirez

:MENU
cls
echo ============================================================
echo                            Wappy                        
echo ============================================================
echo.
echo  [1] Instalar/Verificar Paquetes
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
echo          INSTALANDO/VERIFICANDO PAQUETES                    
echo ============================================================
echo.

echo [Backend] Verificando carpeta server...
if not exist "server" (
    echo [X] Error: No se encontro la carpeta 'server'
    pause
    goto MENU
)

echo [Frontend] Verificando carpeta frontend...
if not exist "frontend" (
    echo [X] Error: No se encontro la carpeta 'frontend'
    pause
    goto MENU
)

echo.
echo ===========================================================
echo [Backend] Instalando dependencias en server...
echo ===========================================================
cd server
if not exist "node_modules" (
    echo Instalando paquetes del backend...
    call npm install
) else (
    echo node_modules ya existe. Verificando actualizaciones...
    call npm install
)
cd ..

echo.
echo ===========================================================
echo [Frontend] Instalando dependencias en frontend...
echo ===========================================================
cd frontend
if not exist "node_modules" (
    echo Instalando paquetes del frontend...
    call npm install
) else (
    echo node_modules ya existe. Verificando actualizaciones...
    call npm install
)
cd ..

echo.
echo ============================================================
echo [OK] Instalacion completada exitosamente
echo ============================================================
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
    echo    Ejecute primero la opcion [1] para instalar paquetes
    pause
    goto MENU
)

if not exist "frontend\node_modules" (
    echo [X] Error: No se encontraron las dependencias del frontend
    echo    Ejecute primero la opcion [1] para instalar paquetes
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
