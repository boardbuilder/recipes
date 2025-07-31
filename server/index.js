const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { email, plan, paymentMethodId } = req.body;

        // Create or get customer
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

        // Define price IDs based on plan
        const priceIds = {
            'monthly': process.env.STRIPE_MONTHLY_PRICE_ID,
            'yearly': process.env.STRIPE_YEARLY_PRICE_ID
        };

        const priceId = priceIds[plan];
        if (!priceId) {
            throw new Error('Invalid plan selected');
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
            customerId: customer.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });

        res.json({
            message: 'Subscription cancelled successfully',
            subscription: subscription
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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        res.json({
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
            console.log('Payment succeeded for subscription:', event.data.object.subscription);
            break;
        case 'invoice.payment_failed':
            console.log('Payment failed for subscription:', event.data.object.subscription);
            break;
        case 'customer.subscription.deleted':
            console.log('Subscription cancelled:', event.data.object.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Get available plans
app.get('/api/plans', (req, res) => {
    res.json({
        plans: [
            {
                id: 'monthly',
                name: 'Monthly Premium',
                price: 9.99,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Unlimited recipe generation',
                    'Advanced dietary filters',
                    'Recipe scaling (2-12 servings)',
                    'Nutritional information',
                    'Recipe collections',
                    'Ad-free experience'
                ]
            },
            {
                id: 'yearly',
                name: 'Yearly Premium',
                price: 79.99,
                currency: 'usd',
                interval: 'year',
                savings: 'Save 33%',
                features: [
                    'Everything in Monthly',
                    'Meal planning tools',
                    'Shopping list generator',
                    'Recipe sharing',
                    'Priority support',
                    'Early access to new features'
                ]
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Recipe app server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 