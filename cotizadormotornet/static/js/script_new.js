document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Referencias a elementos
    const addProductBtn = document.getElementById('addProduct');
    const productsContainer = document.getElementById('productsContainer');
    const hiddenProductsContainer = document.getElementById('hidden-products-container');
    
    // Campos de entrada de productos
    const productNameInput = document.getElementById('product_name_input');
    const productPriceInput = document.getElementById('product_price_input');
    const productQuantityInput = document.getElementById('product_quantity_input');
    
    // Contadores para asignar IDs únicos
    let productCounter = 0;
    
    // Event listener para agregar un nuevo producto
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            addProductToTable();
        });
    }
    
    // Función para agregar un producto a la tabla
    function addProductToTable() {
        const productName = productNameInput.value.trim();
        const productPrice = parseFloat(productPriceInput.value) || 0;
        const productQuantity = parseInt(productQuantityInput.value) || 1;
        
        if (!productName || productPrice <= 0) {
            alert("Por favor ingrese un nombre de producto y precio válido.");
            return;
        }
        
        // Calcular valores
        const productTotal = productQuantity * productPrice;
        const productIva = (productPrice / 1.19) * 0.19; // Calculando el IVA interno del precio
        const productPriceWithoutIva = productPrice - productIva;
        
        // Crear ID único para este producto
        const productId = 'product_' + (++productCounter);
        
        // Crear fila de tabla para el nuevo producto
        const newRow = document.createElement('tr');
        newRow.className = 'product-row';
        newRow.id = productId;
        newRow.innerHTML = `
            <td>${productName}</td>
            <td class="text-center">${productQuantity}</td>
            <td class="text-end">${formatCurrency(productPrice)}</td>
            <td class="text-center">19%</td>
            <td class="text-end">${formatCurrency(productTotal)}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-danger remove-product" data-product-id="${productId}">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;
        
        // Agregar campos ocultos para enviar al servidor
        const hiddenFields = document.createElement('div');
        hiddenFields.id = `hidden_${productId}`;
        hiddenFields.innerHTML = `
            <input type="hidden" name="product_name[]" value="${productName}">
            <input type="hidden" name="product_quantity[]" value="${productQuantity}">
            <input type="hidden" name="product_price[]" value="${productPrice}">
        `;
        
        // Agregar la fila a la tabla y los campos ocultos al formulario
        productsContainer.appendChild(newRow);
        hiddenProductsContainer.appendChild(hiddenFields);
        
        // Reinicializar Feather icons para la nueva fila
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Configurar el botón de eliminar
        const removeBtn = newRow.querySelector('.remove-product');
        removeBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            document.getElementById(productId).remove();
            document.getElementById(`hidden_${productId}`).remove();
            updateTotals();
        });
        
        // Limpiar campos
        productNameInput.value = '';
        productPriceInput.value = '';
        productQuantityInput.value = '1';
        
        // Actualizar totales
        updateTotals();
        
        // Enfocar el campo de nombre para el siguiente producto
        productNameInput.focus();
    }
    
    // Función para actualizar los totales
    function updateTotals() {
        let total = 0;
        
        // Obtener todas las filas de productos
        const productRows = document.querySelectorAll('.product-row');
        
        // Calcular total
        productRows.forEach(row => {
            const priceCell = row.querySelector('td:nth-child(5)').textContent;
            const price = parseFloat(priceCell.replace(/[$,]/g, '')) || 0;
            total += price;
        });
        
        // Actualizar el total en la interfaz
        document.getElementById('total').textContent = formatCurrency(total);
    }
    
    // Función para formatear moneda
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    // Validación del formulario
    const form = document.getElementById('quotationForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            const productRows = document.querySelectorAll('.product-row');
            
            if (productRows.length === 0) {
                event.preventDefault();
                alert('Por favor, agregue al menos un producto a la cotización');
                return;
            }
            
            const salesperson = document.getElementById('salesperson').value;
            if (!salesperson) {
                event.preventDefault();
                alert('Por favor, seleccione un vendedor');
                return;
            }
        });
    }
    
    // Event listeners para los campos de entrada de productos
    productNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            productPriceInput.focus();
        }
    });
    
    productPriceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            productQuantityInput.focus();
        }
    });
    
    productQuantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProductToTable();
        }
    });
});