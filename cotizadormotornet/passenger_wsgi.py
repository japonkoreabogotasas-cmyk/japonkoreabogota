import sys, os

# Obtener la ruta al directorio actual
INTERP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'bin', 'python')
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Añadir el directorio actual al path
cwd = os.getcwd()
sys.path.append(cwd)

# Añadir la ruta del entorno virtual al path
sys.path.append(os.path.join(cwd, 'venv', 'lib', 'python3.9', 'site-packages'))  # Ajusta la versión de Python

# Importar la aplicación directamente
from app_bytesio import app as application