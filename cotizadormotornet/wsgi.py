#!/usr/bin/python
import sys
import os

# Añadir la ruta del proyecto al path de Python
sys.path.insert(0, os.path.dirname(__file__))

# Añadir la ruta del entorno virtual al path de Python
virtual_env = os.path.join(os.path.dirname(__file__), 'venv/lib/python3.8/site-packages')
if os.path.exists(virtual_env):
    sys.path.insert(0, virtual_env)

# Importar la aplicación Flask desde app_bytesio.py como recomiendas
from app_bytesio import app as application
