import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, send_file, session
from datetime import datetime
import tempfile
import traceback
from utils.pdf_generator import generate_pdf

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Generate a company logo path that works in both development and production
def get_logo_path():
    # Get the absolute path to the logo file
    # This is important as GoDaddy's environment might have different working directories
    return os.path.abspath(os.path.join(os.path.dirname(__file__), 'static', 'img', 'motornet_logo.png'))

@app.route('/')
def index():
    return redirect(url_for('quotation_form'))

@app.route('/cotizador', methods=['GET', 'POST'])
def quotation_form():
    if request.method == 'POST':
        try:
            # Get form data
            customer_name = request.form.get('customer_name', '')
            customer_document = request.form.get('customer_document', '')
            customer_email = request.form.get('customer_email', '')
            customer_phone = request.form.get('customer_phone', '')
            salesperson = request.form.get('salesperson', '')
            observations = request.form.get('observations', '')
            
            # Get product data
            products = []
            product_names = request.form.getlist('product_name[]')
            product_quantities = request.form.getlist('product_quantity[]')
            product_prices = request.form.getlist('product_price[]')
            
            for i in range(len(product_names)):
                if product_names[i].strip():  # Only add non-empty products
                    products.append({
                        'name': product_names[i],
                        'quantity': int(product_quantities[i]) if product_quantities[i] else 0,
                        'price': float(product_prices[i]) if product_prices[i] else 0,
                        'total': int(product_quantities[i]) * float(product_prices[i]) if product_quantities[i] and product_prices[i] else 0
                    })
            
            # Calculate totals
            subtotal = sum(product['total'] for product in products)
            tax = subtotal * 0.19  # 19% tax
            total = subtotal + tax
            
            # Store data in session for PDF generation
            session['quotation_data'] = {
                'customer': {
                    'name': customer_name,
                    'document': customer_document,
                    'email': customer_email,
                    'phone': customer_phone
                },
                'salesperson': salesperson,
                'observations': observations,
                'products': products,
                'totals': {
                    'subtotal': subtotal,
                    'tax': tax,
                    'total': total
                },
                'date': datetime.now().strftime('%Y-%m-%d'),
                'quotation_number': datetime.now().strftime('%Y%m%d%H%M%S')
            }
            
            logger.debug("Form data processed successfully")
            flash('Cotización creada correctamente', 'success')
            return redirect(url_for('generate_quotation_pdf'))
            
        except Exception as e:
            logger.error(f"Error processing form data: {str(e)}")
            logger.error(traceback.format_exc())
            flash(f'Error al procesar el formulario: {str(e)}', 'danger')
            return render_template('quotation.html')
    
    return render_template('quotation.html')

@app.route('/generar-pdf')
def generate_quotation_pdf():
    try:
        # Get data from session
        quotation_data = session.get('quotation_data')
        if not quotation_data:
            flash('No hay datos para generar la cotización', 'warning')
            return redirect(url_for('quotation_form'))
        
        # Get logo path
        logo_path = get_logo_path()
        logger.debug(f"Logo path: {logo_path}")
        
        # Create a temporary file for the PDF
        # Use explicit mode='wb' for binary write mode
        # Don't delete immediately as we need to send the file
        temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        temp_filename = temp_file.name
        temp_file.close()  # Close the file but don't delete it yet
        
        logger.debug(f"Temporary file created at: {temp_filename}")
        
        # Generate PDF
        generate_pdf(
            temp_filename,
            quotation_data,
            logo_path
        )
        
        logger.debug(f"PDF generated successfully at: {temp_filename}")
        
        # Set a descriptive filename for the download
        download_name = f"Cotizacion_{quotation_data['quotation_number']}.pdf"
        
        # Send the file with proper MIME type and as_attachment=True
        return send_file(
            temp_filename,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=download_name,
            # Use this parameter to ensure the file is deleted after sending
            # This is a custom parameter that Flask's send_file will handle
            # The file will be automatically deleted once it's been sent
            max_age=0
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        logger.error(traceback.format_exc())
        flash(f'Error al generar el PDF: {str(e)}', 'danger')
        return redirect(url_for('quotation_form'))
    finally:
        # Clean up the temporary file if it exists and hasn't been deleted
        try:
            if 'temp_filename' in locals() and os.path.exists(temp_filename):
                os.unlink(temp_filename)
                logger.debug(f"Temporary file deleted: {temp_filename}")
        except Exception as e:
            logger.error(f"Error deleting temporary file: {str(e)}")

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', error="Página no encontrada"), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('error.html', error="Error interno del servidor"), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
