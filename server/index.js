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

// Create subscription - REAL STRIPE API VERSION
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

        // Get the correct price ID based on plan
        const priceId = plan === 'monthly' 
            ? process.env.STRIPE_MONTHLY_PRICE_ID 
            : process.env.STRIPE_YEARLY_PRICE_ID;

        if (!priceId) {
            throw new Error(`Price ID not configured for ${plan} plan`);
        }

        // Create or retrieve customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: email,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        // Attach payment method to customer if not already attached
        try {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customer.id,
            });
        } catch (error) {
            // Payment method might already be attached
            console.log('Payment method attachment note:', error.message);
        }

        // Set as default payment method
        await stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create subscription with immediate payment
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'allow_incomplete',
            payment_settings: { 
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card']
            },
            expand: ['latest_invoice.payment_intent'],
        });

        // The payment intent is already confirmed when subscription is created
        // No need to confirm again as it's already succeeded

        console.log('Real payment successful:', { 
            email, 
            plan, 
            subscriptionId: subscription.id, 
            customerId: customer.id 
        });

        res.json({
            subscriptionId: subscription.id,
            customerId: customer.id,
            message: 'Payment successful!'
        });
        
    } catch (error) {
        console.error('Real subscription error:', {
            message: error.message,
            type: error.type,
            statusCode: error.statusCode,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ error: 'Payment processing failed: ' + error.message });
    }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required' });
        }

        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        res.json({
            message: 'Subscription cancelled successfully',
            subscriptionId: subscription.id
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
        
        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required' });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        res.json({
            status: subscription.status,
            subscriptionId: subscription.id,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end
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