import tkinter as tk
from time import sleep
import threading

# Nueva letra (ejemplo motivacional, estilo himno ICPC 🎵)
lines = [
    ("Code all night,", 0.07),
    ("Dream in Python,", 0.06),
    ("Debug the world,", 0.08),
    ("Solutions shine bright!", 0.07),
    ("Together we fight,", 0.06),
    ("ICPC we rise!", 0.08)
]

# Ajusta pausas entre frases
delays = [0.8, 0.8, 0.8, 1.2, 0.8, 3]

# Función para mostrar la letra
def run_lyrics(label):
    for i, (line, char_delay) in enumerate(lines):
        text = ""
        for char in line:
            text += char
            label.config(text=text, fg="gold", font=("Arial", 50, "bold"))
            sleep(char_delay)
        sleep(delays[i])

# Crear app Tkinter
root = tk.Tk()
root.attributes("-fullscreen", True)  # Pantalla completa
root.configure(bg="black")

label = tk.Label(root, text="", fg="white", bg="black", font=("Arial", 50, "bold"))
label.pack(expand=True)

# Hilo para no congelar interfaz
threading.Thread(target=run_lyrics, args=(label,), daemon=True).start()

# Tecla ESC para salir
root.bind("<Escape>", lambda e: root.destroy())
root.mainloop()