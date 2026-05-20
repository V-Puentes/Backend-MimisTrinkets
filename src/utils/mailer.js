const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreoConfirmacion = async (emailDestino, nombreCliente, idPedido, total) => {
    try {
        const mailOptions = {
            from: `"Mimis Trinkets" <${process.env.EMAIL_USER}>`,
            to: emailDestino,
            subject: `Confirmación de Pedido N°${idPedido}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>¡Gracias por tu compra, ${nombreCliente}!</h2>
                    <p>Tu pedido <strong>N°${idPedido}</strong> ha sido procesado exitosamente.</p>
                    <p><strong>Total pagado:</strong> $${total}</p>
                    <hr />
                    <p>Puedes descargar el detalle de tu compra y revisar el estado del envío ingresando a tu cuenta en nuestro portal.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo de confirmación enviado a: ${emailDestino}`);
    } catch (error) {
        console.error('Error al enviar correo de confirmación:', error.message);
    }
};

module.exports = { enviarCorreoConfirmacion };