document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const notification = document.getElementById('notification');
    const submitButton = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

    const fields = ['name', 'phone', 'message', 'property_card'];
    const errorElements = {};

    // Crear mensajes de error dinámicos
    fields.forEach(field => {
        const input = form.querySelector(`#${field}`);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        errorElements[field] = errorDiv;
    });

    // Validaciones
    const validators = {
        name: (value) => value.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres',
        phone: (value) => /^[0-9]{10}$/.test(value) ? '' : 'Ingrese un número válido de 10 dígitos',
        message: (value) => value.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres',
        property_card: (file) => {
            if (!file) return '';
            const maxSize = 5 * 1024 * 1024;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            return (file.size > maxSize || !allowedTypes.includes(file.type)) 
                ? 'Archivo no permitido o demasiado grande (máx. 5MB)' 
                : '';
        }
    };

    // Validación en tiempo real
    fields.forEach(field => {
        const input = form.querySelector(`#${field}`);
        ['input', 'change', 'blur'].forEach(eventType => {
            input.addEventListener(eventType, () => {
                const error = validators[field](field === 'property_card' ? input.files[0] : input.value);
                errorElements[field].textContent = error;
                input.style.borderColor = error ? '#dc3545' : '#ddd';
                updateSubmitButton();
            });
        });
    });

    function updateSubmitButton() {
        submitButton.disabled = Object.values(errorElements).some(el => el.textContent !== '');
    }

    function showNotification(message, type) {
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        notification.style.color = type === 'success' ? '#155724' : '#721c24';
        setTimeout(() => notification.style.display = 'none', 5000);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (isSubmitting) return;

        let hasErrors = false;
        fields.forEach(field => {
            const input = form.querySelector(`#${field}`);
            const error = validators[field](field === 'property_card' ? input.files[0] : input.value);
            errorElements[field].textContent = error;
            if (error) hasErrors = true;
        });

        if (hasErrors) {
            showNotification('Por favor, corrija los errores en el formulario.', 'error');
            return;
        }

        isSubmitting = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';
        document.querySelector('.loading-spinner').style.display = 'inline-block';

        try {
            const formData = new FormData(form);
            const response = await fetch('/contact.php', { method: 'POST', body: formData });
            const result = await response.json();

            showNotification(result.message, result.status);
            if (result.status === 'success') form.reset();
        } catch (error) {
            showNotification('Error al enviar el formulario. Inténtelo de nuevo.', 'error');
        } finally {
            isSubmitting = false;
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar';
            document.querySelector('.loading-spinner').style.display = 'none';
        }
    });
});
