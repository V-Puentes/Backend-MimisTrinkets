const { WebpayPlus } = require('transbank-sdk');
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');

// Configuración del entorno de PRUEBAS (Integración) de Transbank
const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
);

// 1. Inicia la transacción y devuelve la URL de pago al Frontend
const iniciarPago = async (req, res) => {
    try {
        const { monto, ordenCompra, sessionId } = req.body;
        
        // Esta es la ruta de tu backend a la que Transbank devolverá al usuario tras pagar
        // Ajusta el puerto (ej: 3000 o 5000) según el que use tu backend
        const returnUrl = `http://localhost:3000/api/transbank/confirmar`; 

        const response = await tx.create(
            ordenCompra, 
            sessionId.toString(), 
            monto, 
            returnUrl
        );

        // Retornamos el token y la URL al frontend para que haga la redirección
        res.json({
            url: response.url,
            token: response.token
        });

    } catch (error) {
        console.error('Error al crear transacción Transbank:', error);
        res.status(500).json({ message: 'Error interno al comunicar con Transbank' });
    }
};

// 2. Recibe al usuario de vuelta desde Transbank y confirma el cobro
const confirmarPago = async (req, res) => {
    // Transbank envía el token por GET (token_ws) o POST dependiendo de si el pago fue exitoso o abortado
    const token = req.query.token_ws || req.body.token_ws;

    if (!token) {
        return res.redirect('http://localhost:5173/pago-fallido'); // Redirige al frontend
    }

    try {
        // Ejecutar el commit (captura real del dinero)
        const response = await tx.commit(token);

        if (response.status === 'AUTHORIZED') {
            // TODO: Aquí insertaremos el Pedido en la base de datos más adelante
            // Por ahora, redirigimos directamente a la vista de éxito en el frontend
            res.redirect('http://localhost:5173/mis-pedidos');
        } else {
            res.redirect('http://localhost:5173/pago-fallido');
        }

    } catch (error) {
        console.error('Error al confirmar transacción:', error);
        res.redirect('http://localhost:5173/pago-fallido');
    }
};

module.exports = {
    iniciarPago,
    confirmarPago
};