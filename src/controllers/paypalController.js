const axios = require('axios');

// Configuraciones de Entorno Sandbox (Pruebas)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'TU_CLIENT_ID_DE_PRUEBA';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'TU_SECRET_DE_PRUEBA';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// Tasa de conversión simulada
const TASA_CAMBIO_CLP_USD = 950;

// Generar Token de Acceso OAuth2
const generateAccessToken = async () => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data.access_token;
};

// Crear Orden de Pago (Invocado por el Frontend)
const crearOrdenPayPal = async (req, res) => {
    try {
        const { monto } = req.body;

        // Conversión a USD con 2 decimales estrictos
        const montoUSD = (monto / TASA_CAMBIO_CLP_USD).toFixed(2);
        const accessToken = await generateAccessToken();

        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: montoUSD
                    }
                }
            ],
            application_context: {
                // URLs a las que PayPal redirigirá al usuario tras aceptar o cancelar el pago
                return_url: 'http://localhost:3000/api/paypal/capturar', 
                cancel_url: 'http://localhost:5173/checkout?estado=cancelado',
                user_action: 'PAY_NOW'
            }
        };

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, orderPayload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Extraer la URL de aprobación de la respuesta de PayPal
        const approveLink = response.data.links.find(link => link.rel === 'approve').href;

        res.json({ url: approveLink, id_orden: response.data.id });
    } catch (error) {
        console.error('Error API PayPal:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error interno al procesar transacción con PayPal.' });
    }
};

// Capturar el Pago (Invocado por PayPal tras la aprobación del cliente)
const capturarPagoPayPal = async (req, res) => {
    try {
        const { token } = req.query; // ID de la orden devuelto por PayPal
        const accessToken = await generateAccessToken();

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status === 'COMPLETED') {
            // Confirmación exitosa. Aquí se debe actualizar el estado del pedido en la base de datos a "Pagado".
            res.redirect('http://localhost:5173/mis-pedidos?pago=exito');
        } else {
            res.redirect('http://localhost:5173/mis-pedidos?pago=fallido');
        }
    } catch (error) {
        console.error('Error al capturar pago:', error.response ? error.response.data : error.message);
        res.redirect('http://localhost:5173/mis-pedidos?pago=error');
    }
};

module.exports = {
    crearOrdenPayPal,
    capturarPagoPayPal
};