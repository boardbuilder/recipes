require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_MONTHLY_PRICE_ID',
    'STRIPE_YEARLY_PRICE_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: true, // Allow all origins for testing
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Payment-specific rate limiting
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 payment requests per windowMs
    message: 'Too many payment attempts from this IP, please try again later.'
});

app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static('../'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Recipe app server is running' });
});

// Create payment intent for one-time payments
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create subscription - SIMPLIFIED VERSION FOR TESTING
app.post('/api/create-subscription', paymentLimiter, async (req, res) => {
    try {
        const { email, plan, paymentMethodId } = req.body;
        
        // Input validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        
        if (!['monthly', 'yearly'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }
        
        if (!paymentMethodId || typeof paymentMethodId !== 'string') {
            return res.status(400).json({ error: 'Valid payment method is required' });
        }

        // For testing purposes, simulate a successful payment
        // In production, you would use real Stripe API calls
        const subscriptionId = 'sub_test_' + Date.now();
        const customerId = 'cus_test_' + Date.now();
        
        console.log('Payment successful:', { email, plan, subscriptionId, customerId });

        res.json({
            subscriptionId: subscriptionId,
            customerId: customerId,
            message: 'Payment successful!'
        });
        
    } catch (error) {
        console.error('Subscription error:', {
            message: error.message,
            type: error.type,
            statusCode: error.statusCode,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        res.json({
            message: 'Subscription cancelled successfully',
            subscriptionId: subscriptionId
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get subscription status
app.get('/api/subscription-status/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        // For testing, return active status
        res.json({
            status: 'active',
            subscriptionId: subscriptionId
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
            console.log('Payment succeeded:', event.data.object);
            break;
        case 'customer.subscription.created':
            console.log('Subscription created:', event.data.object);
            break;
        case 'customer.subscription.updated':
            console.log('Subscription updated:', event.data.object);
            break;
        case 'customer.subscription.deleted':
            console.log('Subscription deleted:', event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Recipe app server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 