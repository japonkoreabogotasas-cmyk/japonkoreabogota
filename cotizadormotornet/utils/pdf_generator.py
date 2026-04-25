import logging
import os
import traceback
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

# Configure logging
logger = logging.getLogger(__name__)


def generate_pdf(output_path, quotation_data, logo_path):
    """
    Generate a PDF quotation
    
    Args:
        output_path (str): Path where to save the PDF or a file-like object
        quotation_data (dict): Data for the quotation
        logo_path (str): Path to the company logo
    """
    try:
        logger.debug(f"Starting PDF generation to {output_path}")
        logger.debug(f"Using logo from {logo_path}")

        # Verify that logo exists
        if not os.path.exists(logo_path):
            logger.error(f"Logo file not found at {logo_path}")
            raise FileNotFoundError(f"Logo file not found at {logo_path}")

        # Create the document with explicit pagesize
        doc = SimpleDocTemplate(output_path,
                                pagesize=letter,
                                rightMargin=72,
                                leftMargin=72,
                                topMargin=72,
                                bottomMargin=72)

        # Container for the 'Flowable' objects
        elements = []

        # Styles
        styles = getSampleStyleSheet()
        styles.add(
            ParagraphStyle(name='Center',
                           parent=styles['Heading1'],
                           alignment=TA_CENTER))
        styles.add(
            ParagraphStyle(name='Right',
                           parent=styles['Normal'],
                           alignment=TA_RIGHT))

        # Add logo
        try:
            # Set a fixed width of 2 inches, maintaining aspect ratio
            logo = Image(logo_path, width=2 * inch)
            elements.append(logo)
        except Exception as e:
            logger.error(f"Error adding logo: {str(e)}")
            logger.error(traceback.format_exc())
            # Continue without logo

        elements.append(Spacer(1, 12))

        # Add title
        elements.append(Paragraph("COTIZACIÓN", styles['Center']))
        elements.append(Spacer(1, 12))

        # Add quotation details
        elements.append(
            Paragraph(f"Número: {quotation_data['quotation_number']}",
                      styles['Normal']))
        elements.append(
            Paragraph(f"Fecha: {quotation_data['date']}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Add customer information
        elements.append(
            Paragraph("Información del Cliente:", styles['Heading2']))
        elements.append(
            Paragraph(f"Nombre: {quotation_data['customer']['name']}",
                      styles['Normal']))
        elements.append(
            Paragraph(f"Email: {quotation_data['customer']['email']}",
                      styles['Normal']))
        elements.append(
            Paragraph(f"Teléfono: {quotation_data['customer']['phone']}",
                      styles['Normal']))
        elements.append(Spacer(1, 12))

        # Add products table
        data = [['Producto', 'Cantidad', 'Precio Unitario', 'Total']]
        for product in quotation_data['products']:
            data.append([
                product['name'],
                str(product['quantity']), f"${product['price']:,.2f}",
                f"${product['total']:,.2f}"
            ])

        # Add totals
        data.append([
            '', '', 'Subtotal', f"${quotation_data['totals']['subtotal']:,.2f}"
        ])
        data.append(
            ['', '', 'IVA (19%)', f"${quotation_data['totals']['tax']:,.2f}"])
        data.append(
            ['', '', 'Total', f"${quotation_data['totals']['total']:,.2f}"])

        # Create the table with a specific column width
        table = Table(data,
                      colWidths=[3 * inch, 1 * inch, 1.5 * inch, 1.5 * inch])

        # Add style to the table
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -4), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -3), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -4), 1, colors.black),
            ('LINEABOVE', (2, -3), (-1, -3), 1, colors.black),
        ])

        table.setStyle(style)
        elements.append(table)

        # Add terms and conditions
        elements.append(Spacer(1, 20))
        elements.append(
            Paragraph("Términos y Condiciones:", styles['Heading3']))
        elements.append(
            Paragraph("1. Esta cotización es válida por 30 días.",
                      styles['Normal']))
        elements.append(
            Paragraph("2. Los precios pueden cambiar sin previo aviso.",
                      styles['Normal']))
        elements.append(
            Paragraph("3. El tiempo de entrega depende de la disponibilidad.",
                      styles['Normal']))

        # Build the PDF
        logger.debug("Building PDF document")
        doc.build(elements)
        logger.debug(f"PDF successfully generated at {output_path}")

        return True

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        logger.error(traceback.format_exc())
        raise
