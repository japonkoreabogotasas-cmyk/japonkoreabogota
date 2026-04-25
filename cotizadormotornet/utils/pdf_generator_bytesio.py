import os
import logging
import traceback
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageTemplate, Frame
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Configure logger
logger = logging.getLogger(__name__)

# Registrar la fuente personalizada
try:
    font_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'fonts', 'army_buster.otf')
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('ArmyBuster', font_path))
        logger.info("Fuente personalizada registrada correctamente")
    else:
        logger.warning(f"Archivo de fuente no encontrado en: {font_path}")
except Exception as e:
    logger.error(f"Error al registrar fuente personalizada: {str(e)}")

def add_page_elements(canvas, doc):
    """Add all fixed elements to the page: border, logo, vertical text, etc."""
    width, height = letter

    # 1. Add border around the page
    canvas.saveState()
    canvas.setStrokeColor(colors.black)
    canvas.setLineWidth(0.5)
    canvas.rect(
        0.5*inch,  # x
        0.5*inch,  # y
        width - inch,  # width
        height - inch,  # height
    )

    # 2. Add vertical text on both sides with smaller font
    # Left side vertical text
    canvas.saveState()
    canvas.setFont('Helvetica', 5)  # Reduced size
    canvas.translate(0.35*inch, height/2)
    canvas.rotate(90)
    canvas.drawString(0, 0, "www.motornet.shop")
    canvas.restoreState()

    # Right side vertical text
    canvas.saveState()
    canvas.setFont('Helvetica', 5)  # Reduced size
    canvas.translate(width - 0.35*inch, height/2)
    canvas.rotate(-90)
    canvas.drawString(0, 0, "www.bodegahyundaikia.motornet.shop")
    canvas.restoreState()

    # 3. Usar la fuente personalizada para el logo textual o imagen como respaldo
    logo_path = getattr(doc, 'logo_path', None)
    
    # Si se registró la fuente personalizada, úsala para "MOTORNET"
    if 'ArmyBuster' in pdfmetrics.getRegisteredFontNames():
        # Logo con fuente personalizada
        canvas.setFillColor(colors.black)  # Color del texto
        canvas.setFont('ArmyBuster', 30)  # Tamaño grande para el logo
        canvas.drawString(inch, height - 1.2*inch, "MOTORNET")
        canvas.setFont('Helvetica', 12)
        canvas.drawString(inch + 10, height - 1.4*inch, "SHOP")
        logger.debug("Logo dibujado con fuente personalizada ArmyBuster")
    # Si no se pudo registrar la fuente, intentar con el logo de imagen
    elif logo_path and os.path.exists(logo_path):
        try:
            canvas.drawImage(
                logo_path, 
                inch, 
                height - 1.5*inch,
                width=2*inch, 
                height=0.8*inch,
                preserveAspectRatio=True,
                mask='auto'
            )
            logger.debug(f"Logo dibujado en el canvas desde: {logo_path}")
        except Exception as e:
            logger.error(f"Error rendering logo in canvas: {str(e)}")
            # Fallback a texto normal
            canvas.setFont('Helvetica-Bold', 24)
            canvas.drawString(inch, height - 1.2*inch, "MOTORNET")
            canvas.setFont('Helvetica', 12)
            canvas.drawString(inch, height - 1.4*inch, "SHOP")
    else:
        # Fallback a texto normal
        canvas.setFont('Helvetica-Bold', 24)
        canvas.drawString(inch, height - 1.2*inch, "MOTORNET")
        canvas.setFont('Helvetica', 12)
        canvas.drawString(inch, height - 1.4*inch, "SHOP")

    # 4. Company info with smaller font
    canvas.setFont('Helvetica', 8)  # Reduced size
    y_position = height - 1.25*inch

    canvas.drawRightString(width - inch, y_position, "Colombia, Bogotá")
    canvas.drawRightString(width - inch, y_position - 12, "+57 3112441952")
    canvas.drawRightString(width - inch, y_position - 24, "soporteenventas@motornet.shop")
    canvas.drawRightString(width - inch, y_position - 36, "www.tienda.motornet.shop")

    # Date
    if hasattr(doc, 'fecha'):
        fecha = doc.fecha
    else:
        fecha = datetime.now().strftime('%d/%m/%Y')
    canvas.drawRightString(width - inch, y_position - 60, f"Fecha: {fecha}")

    canvas.restoreState()

def generate_pdf_to_bytesio(quotation_data, logo_path):
    """
    Generate a PDF quotation to a BytesIO buffer based on Motornet template

    Args:
        quotation_data (dict): Data for the quotation
        logo_path (str): Path to the company logo or URL for remote logo

    Returns:
        BytesIO: Buffer containing the PDF
    """
    try:
        # Create a BytesIO buffer
        buffer = BytesIO()

        logger.debug(f"Starting PDF generation to BytesIO buffer")
        logger.debug(f"Using logo from {logo_path}")

        # Ahora que tenemos la fuente personalizada, el logo es opcional
        # pero seguimos guardando la ruta para compatibilidad
        if logo_path and not os.path.exists(logo_path):
            logger.warning(f"Logo file not found at {logo_path}")
            # Try to find the logo in common locations
            possible_paths = [
                os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "img", "motornet_logo.png"),
                os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "img", "logo.png"),
                os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "logomotornet.png")
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    logger.debug(f"Found logo at alternative location: {path}")
                    logo_path = path
                    break

        # Create the document with explicit pagesize and margins
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=1.5*inch,
            bottomMargin=0.5*inch
        )

        doc.logo_path = logo_path

        # Set the date 
        if 'date' in quotation_data:
            doc.fecha = quotation_data['date']

        # Create page templates with fixed elements
        template = PageTemplate(
            id='main_template',
            frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')],
            onPage=add_page_elements
        )
        doc.addPageTemplates([template])

        # Container for the 'Flowable' objects
        elements = []

        # Styles with reduced font sizes
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name='Center',
            parent=styles['Heading1'],
            alignment=TA_CENTER,
            fontSize=10,  # Reduced from 12
            spaceAfter=0.2*inch
        ))

        # Add COTIZACIÓN title
        elements.append(Paragraph("COTIZACIÓN", styles['Center']))
        elements.append(Spacer(1, 0.2*inch))

        # Customer information including salesperson
        customer = quotation_data.get('customer', {})
        salesperson = quotation_data.get('salesperson', '')

        if isinstance(customer, dict):
            cliente_data = [
                ['Cliente:', customer.get('name', '')],
                ['NIT/Doc:', customer.get('document', '')]
            ]
        else:
            # Manejar el formato antiguo
            cliente_data = [
                ['Cliente:', quotation_data.get('nombre', '')],
                ['Email:', quotation_data.get('email', '')],
                ['Teléfono:', quotation_data.get('telefono', '')]
            ]

        if salesperson:
            cliente_data.append(['Vendedor:', salesperson])

        cliente_table = Table(cliente_data, colWidths=[1*inch, 4*inch])
        cliente_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),  # Reduced from 9
        ]))
        elements.append(cliente_table)
        elements.append(Spacer(1, 0.3*inch))

        # Products table
        data = [['Producto', 'Precio antes de IVA', 'IVA (19%)', 'PRECIO (IVA incluido)']]

        if 'products' in quotation_data and isinstance(quotation_data['products'], list):
            products = quotation_data['products']
        else:
            # Formato simple para compatibilidad
            products = [{
                'name': quotation_data.get('vehiculo', 'Modelo no especificado'),
                'price': 10000000,
                'quantity': 1
            }]

        total_before_tax = 0
        total_tax = 0
        total_with_tax = 0

        for product in products:
            if isinstance(product, dict):
                price_with_tax = product.get('total', 0)
                if price_with_tax == 0 and 'price' in product and 'quantity' in product:
                    price_with_tax = product['price'] * product['quantity']
                tax_amount = price_with_tax * 0.19 / 1.19
                price_without_tax = price_with_tax - tax_amount

                total_before_tax += price_without_tax
                total_tax += tax_amount
                total_with_tax += price_with_tax

                data.append([
                    product.get('name', 'Producto'),
                    f"${price_without_tax:,.0f}",
                    f"${tax_amount:,.0f}",
                    f"${price_with_tax:,.0f}"
                ])

        available_width = letter[0] - 2*inch
        col_widths = [available_width*0.4, available_width*0.2, available_width*0.2, available_width*0.2]

        table = Table(data, colWidths=col_widths)

        light_blue = colors.Color(0.85, 0.95, 1.0)
        gray = colors.Color(0.9, 0.9, 0.9)

        table_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), light_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 7),  # Further reduced from 8
            ('BACKGROUND', (0, 1), (-1, -1), gray),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),  # Further reduced from 8
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.black),
        ])

        table.setStyle(table_style)
        elements.append(table)

        elements.append(Spacer(1, 0.3*inch))

        # Totals table
        totals_data = [
            ['Total antes de IVA:', f"${total_before_tax:,.0f}"],
            ['IVA (19%):', f"${total_tax:,.0f}"],
            ['Total (IVA incluido):', f"${total_with_tax:,.0f}"]
        ]

        totals_table = Table(totals_data, colWidths=[1.5*inch, 1.5*inch])
        totals_style = TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, -1), 7),  # Further reduced from 8
        ])

        totals_table.setStyle(totals_style)

        elements.append(
            Table([[Spacer(1, 0), totals_table]], 
                 colWidths=[4*inch, 3*inch], 
                 style=[('ALIGN', (1, 0), (1, 0), 'RIGHT')])
        )

        elements.append(Spacer(1, 1.5*inch))

        # Add horizontal line
        elements.append(
            Table([['']], colWidths=[doc.width], 
                style=[('LINEABOVE', (0, 0), (0, 0), 1, colors.black)])
        )

        elements.append(Spacer(1, 0.1*inch))

        # Footer styles with increased font sizes for better readability
        footer_style = ParagraphStyle(
            name='FooterInfo',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,  # Increased from 6 to 8
            alignment=TA_LEFT,
            spaceBefore=0,
            spaceAfter=3  # Increased spacing for better readability
        )

        footer_bold_style = ParagraphStyle(
            name='FooterBold',
            parent=footer_style,
            fontName='Helvetica-Bold'
        )

        # Footer content
        elements.append(Paragraph("INDICACIONES DE COMPRA:", footer_bold_style))
        elements.append(Paragraph("1. Para compras en Bogotá (Envío Contra Entrega):", footer_style))
        elements.append(Paragraph("    - Contáctenos para confirmar disponibilidad.", footer_style))
        elements.append(Paragraph("    - Indique la dirección del taller, almacén o rectificadora.", footer_style))
        elements.append(Paragraph("    - Reciba y revise su pedido antes de pagar.", footer_style))
        elements.append(Paragraph("    - Métodos de pago: Bold, Wompi, Datáfono Virtual (PSE) o Bancolombia.", footer_style))
        elements.append(Paragraph("    - Nunca solicitamos pagos por adelantado en Bogotá.", footer_style))

        elements.append(Paragraph("2. Para compras en otras ciudades:", footer_style))
        elements.append(Paragraph("    - Envío solo previa transferencia antes del despacho.", footer_style))

        elements.append(Spacer(1, 0.15*inch))  # Increased spacing

        elements.append(Paragraph("Gracias por confiar en Motornet.shop", footer_style))
        elements.append(Paragraph("Todos nuestros productos se entregan con factura electrónica y garantía física en culatas, cigüeñales, bombas y bloques.", footer_style))
        elements.append(Paragraph("La garantía cubre exclusivamente defectos de fabricación, asegurando calidad y confianza en cada compra.", footer_style))

        # Build the PDF
        logger.debug("Building PDF document")
        doc.build(elements)

        buffer.seek(0)
        return buffer

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        logger.error(traceback.format_exc())
        raise