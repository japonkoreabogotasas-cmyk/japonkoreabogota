from utils.pdf_generator_bytesio import generate_pdf_to_bytesio
from io import BytesIO
import os

# Datos de prueba con la estructura correcta
test_data = {
    "customer": {
        "name": "Cliente de Prueba",
        "email": "test@example.com",
        "phone": "123456789",
        "document": "900123456"
    },
    "salesperson": "Maicol Aranda",
    "date": "2025-03-15",
    "products": [
        {
            "name": "Producto de Prueba",
            "quantity": 1,
            "price": 119000
        }
    ],
    "totals": {
        "subtotal": 100000,
        "tax": 19000,
        "total": 119000
    }
}

# Verifica la ruta del logo
logo_path = "static/img/motornet_logo.png"
if not os.path.exists(logo_path):
    print(f"Error: El archivo del logo no existe en {logo_path}")
    print("Buscando el logo en otras ubicaciones...")
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith("logo.png"):
                print(f"Logo encontrado en: {os.path.join(root, file)}")

# Intenta generar un PDF
try:
    pdf_buffer = generate_pdf_to_bytesio(test_data, logo_path)
    with open('test.pdf', 'wb') as f:
        f.write(pdf_buffer.getvalue())
    print("PDF generado exitosamente. Archivo guardado como 'test.pdf'")
except Exception as e:
    print(f"Error al generar PDF: {str(e)}")