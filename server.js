require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key_here');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', email, plan } = req.body;
        
        console.log('Creating payment intent for:', { amount, currency, email, plan });
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                email: email,
                plan: plan
            }
        });
        
        console.log('Payment intent created:', paymentIntent.id);
        
        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Confirm payment endpoint
app.post('/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;
        
        console.log('Confirming payment:', { paymentIntentId, paymentMethodId });
        
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId
        });
        
        console.log('Payment confirmed:', paymentIntent.status);
        
        res.json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for payment events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            console.log('Amount charged:', paymentIntent.amount);
            console.log('Customer email:', paymentIntent.metadata.email);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log('Payment processing is now live!');
}); 