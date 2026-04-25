document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Get references to buttons and containers
    const addProductBtn = document.getElementById('addProduct');
    const productsContainer = document.getElementById('productsContainer');
    
    // Event listener for adding a new product row
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            addProductRow();
            updateTotals();
        });
    }
    
    // Enable the first remove button if there's more than one product
    enableDisableRemoveButtons();
    
    // Add event listeners for existing inputs
    setupInputEventListeners();
    
    // Calculate initial totals
    updateTotals();
    
    // Function to add a new product row
    function addProductRow() {
        // Clone the first product row
        const firstRow = document.querySelector('.product-row');
        const newRow = firstRow.cloneNode(true);
        
        // Clear input values
        newRow.querySelectorAll('input').forEach(input => {
            if (input.name === "product_quantity[]") {
                input.value = "1";
            } else {
                input.value = "";
            }
        });
        
        // Enable the remove button
        const removeBtn = newRow.querySelector('.remove-product');
        removeBtn.disabled = false;
        
        // Add event listener to the remove button
        removeBtn.addEventListener('click', function() {
            newRow.remove();
            enableDisableRemoveButtons();
            updateTotals();
        });
        
        // Add event listeners to the new inputs
        newRow.querySelectorAll('.quantity-input, .price-input').forEach(input => {
            input.addEventListener('input', updateTotals);
        });
        
        // Append the new row to the container
        productsContainer.appendChild(newRow);
        
        // Update remove buttons status
        enableDisableRemoveButtons();
        
        // Re-initialize Feather icons for the new row
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    // Function to enable/disable remove buttons based on the number of product rows
    function enableDisableRemoveButtons() {
        const productRows = document.querySelectorAll('.product-row');
        const removeButtons = document.querySelectorAll('.remove-product');
        
        if (productRows.length === 1) {
            removeButtons[0].disabled = true;
        } else {
            removeButtons.forEach(btn => {
                btn.disabled = false;
            });
        }
    }
    
    // Function to set up event listeners for existing inputs
    function setupInputEventListeners() {
        // Add event listeners to quantity and price inputs for calculation
        document.querySelectorAll('.quantity-input, .price-input').forEach(input => {
            input.addEventListener('input', updateTotals);
        });
        
        // Add event listeners to existing remove buttons
        document.querySelectorAll('.remove-product').forEach((btn, index) => {
            if (index === 0) return; // Skip the first one as it's handled separately
            
            btn.addEventListener('click', function() {
                btn.closest('.product-row').remove();
                enableDisableRemoveButtons();
                updateTotals();
            });
        });
    }
    
    // Function to update totals
    function updateTotals() {
        let subtotal = 0;
        
        // Get all product rows
        const productRows = document.querySelectorAll('.product-row');
        
        // Calculate subtotal
        productRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            subtotal += quantity * price;
        });
        
        // Calculate tax and total
        const tax = subtotal * 0.19; // 19% IVA
        const total = subtotal + tax;
        
        // Update display
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('tax').textContent = formatCurrency(tax);
        document.getElementById('total').textContent = formatCurrency(total);
    }
    
    // Function to format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    // Form validation
    const form = document.getElementById('quotationForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            // Check if any product name, quantity or price is empty
            let isValid = true;
            const productRows = document.querySelectorAll('.product-row');
            
            productRows.forEach(row => {
                const name = row.querySelector('input[name="product_name[]"]').value.trim();
                const quantity = row.querySelector('input[name="product_quantity[]"]').value.trim();
                const price = row.querySelector('input[name="product_price[]"]').value.trim();
                
                if (!name || !quantity || !price) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                event.preventDefault();
                alert('Por favor, complete todos los campos de productos');
            }
        });
    }
});
