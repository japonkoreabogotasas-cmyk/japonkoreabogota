<?php 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function validatePhone($phone) {
    return preg_match("/^[0-9]{10}$/", $phone);
}

function validateFile($file) {
    if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return true; 
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    $maxSize = 5 * 1024 * 1024; 

    if ($file['error'] !== UPLOAD_ERR_OK || !in_array($file['type'], $allowedTypes) || $file['size'] > $maxSize) {
        return false;
    }
    return true;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $name = sanitizeInput($_POST['name'] ?? '');
        $phone = sanitizeInput($_POST['phone'] ?? '');
        $vin = sanitizeInput($_POST['vin'] ?? '');
        $message = sanitizeInput($_POST['message'] ?? '');
        $propertyCard = $_FILES['property_card'] ?? null;

        if (empty($name) || empty($phone) || empty($message)) {
            throw new Exception('Todos los campos obligatorios deben ser completados.');
        }

        if (!validatePhone($phone)) {
            throw new Exception('Número de teléfono inválido. Debe tener 10 dígitos.');
        }

        if (!validateFile($propertyCard)) {
            throw new Exception('El archivo no cumple con los requisitos.');
        }
        
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Port = 465;  // Puerto recomendado para SMTPS
        $mail->CharSet = 'UTF-8';  // Codificación de caracteres
        $mail->Host = 'japonkoreabogota.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'formularioscontacto@japonkoreabogota.com';
        $mail->Password = '1234567jakobo.'; // No pongas la contraseña en el código
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->setFrom('formularioscontacto@japonkoreabogota.com', 'Japon Korea Bogota');
        $mail->addAddress('atencionhyundaikia@hotmail.com', 'Soporte Japon Korea');

        if ($propertyCard && $propertyCard['error'] === UPLOAD_ERR_OK) {
            $mail->addAttachment($propertyCard['tmp_name'], $propertyCard['name']);
        }

        $mail->isHTML(true);
        $mail->Subject = 'Nuevo contacto desde la web - ' . date('Y-m-d H:i:s');
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #0033a0;'>
        <div style='text-align: center; margin-bottom: 20px;'>
        <!-- Espacio para el logo -->
        <img src='https://japonkoreabogota.com/assets/img/logo_jk7a2025.png' alt='Logo de la empresa' style='max-width: 150px; margin-bottom: 10px;'>
        </div>
        <h2 style='color: #0033a0; text-align: center;'>Nuevo mensaje recibido</h2>
        <div style='background: #ffcc00; padding: 10px; border-radius: 5px;'>
        <p><strong>Nombre:</strong> $name</p>
        <p><strong>Número de celular:</strong> $phone</p>
        <p><strong>VIN / Chasis:</strong> $vin</p>
        </div>
        <h3 style='color: #d60000;'>Piezas a cotizar:</h3>
        <p style='background: #eeeeee; padding: 10px; border-left: 4px solid #d60000;'>$message</p>
        <p style='color: #666; font-size: 12px; text-align: center;'>
        Enviado el " . date('d/m/Y H:i') . "
        </p>
        </div>
        ";
        $mail->AltBody = "Nuevo mensaje recibido\n\nNombre: $name\nNúmero de celular: $phone\nVIN / Chasis: $vin\nPiezas a comprar:\n$message";

        $mail->send();

        echo json_encode(['status' => 'success', 'message' => '¡Mensaje enviado con éxito!']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error al enviar el mensaje: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
}
?>




