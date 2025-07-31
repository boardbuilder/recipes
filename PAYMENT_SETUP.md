# 🚀 Recipe App Payment Setup Guide

This guide will help you set up real payments for your recipe app using Stripe.

## 📋 Prerequisites

- Node.js installed (version 14 or higher)
- A Stripe account (free to create)
- Your recipe app code

## 🔧 Step 1: Create Stripe Account

1. **Go to [stripe.com](https://stripe.com)**
2. **Click "Start now"** to create a free account
3. **Complete the signup process**
4. **Verify your email address**

## 🔑 Step 2: Get Your Stripe API Keys

1. **Log into your Stripe Dashboard**
2. **Go to Developers → API keys**
3. **Copy your keys:**
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

## 💳 Step 3: Create Products and Prices

1. **In Stripe Dashboard, go to Products**
2. **Click "Add product"**
3. **Create Monthly Premium:**
   - Name: "Monthly Premium"
   - Price: $9.99
   - Billing: Recurring
   - Interval: Monthly
4. **Create Yearly Premium:**
   - Name: "Yearly Premium" 
   - Price: $79.99
   - Billing: Recurring
   - Interval: Yearly
5. **Copy the Price IDs** (starts with `price_`)

## ⚙️ Step 4: Set Up Environment Variables

1. **Create a `.env` file in the server folder:**
```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Product Price IDs
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# Webhook Secret (we'll set this up later)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🛠️ Step 5: Install Dependencies

1. **Navigate to the server folder:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

## 🚀 Step 6: Start the Server

1. **Start the development server:**
```bash
npm run dev
```

2. **Test the server:**
   - Open: `http://localhost:3001/api/health`
   - Should see: `{"status":"OK","message":"Recipe app server is running"}`

## 🔗 Step 7: Set Up Webhooks

1. **In Stripe Dashboard, go to Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL:** `https://your-domain.com/api/webhook`
4. **Events to send:**
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. **Copy the webhook signing secret** and add it to your `.env` file

## 💰 Step 8: Update Frontend

The frontend is already configured to work with the payment system. The payment flow will:

1. **User clicks "Upgrade Now"**
2. **Selects a plan** (Monthly/Yearly)
3. **Enters payment details**
4. **Stripe processes the payment**
5. **User gets premium access**

## 🧪 Step 9: Test the Payment System

### Test Mode (Recommended for Development)
- Use Stripe's test card numbers:
  - **Success:** `4242 4242 4242 4242`
  - **Decline:** `4000 0000 0000 0002`
- Use any future expiry date
- Use any 3-digit CVC

### Live Mode (For Production)
- Switch to live keys in Stripe Dashboard
- Use real payment methods
- Process real transactions

## 📊 Revenue Projections

### Monthly Revenue Scenarios:
- **10 users:** $99.90/month
- **50 users:** $499.50/month  
- **100 users:** $999.00/month
- **500 users:** $4,995.00/month

### Yearly Revenue Scenarios:
- **10 users:** $799.90/year
- **50 users:** $3,999.50/year
- **100 users:** $7,999.00/year
- **500 users:** $39,995.00/year

## 🔒 Security Features

- **PCI Compliance:** Stripe handles all sensitive payment data
- **Encryption:** All data encrypted in transit and at rest
- **Fraud Protection:** Stripe's built-in fraud detection
- **Webhook Verification:** Secure webhook signature verification
- **Error Handling:** Comprehensive error handling and logging

## 🚀 Deployment Options

### Option 1: Heroku (Recommended)
1. **Create Heroku account**
2. **Connect your GitHub repository**
3. **Set environment variables in Heroku dashboard**
4. **Deploy automatically**

### Option 2: DigitalOcean
1. **Create Droplet**
2. **Install Node.js**
3. **Set up PM2 for process management**
4. **Configure nginx reverse proxy**

### Option 3: AWS/GCP
1. **Use App Engine or Elastic Beanstalk**
2. **Set up environment variables**
3. **Configure custom domain**

## 📈 Analytics & Monitoring

### Stripe Dashboard Features:
- **Real-time revenue tracking**
- **Customer analytics**
- **Payment success rates**
- **Subscription metrics**

### Custom Analytics:
- **User engagement tracking**
- **Recipe generation stats**
- **Premium feature usage**

## 🎯 Next Steps

1. **Test the payment flow thoroughly**
2. **Set up monitoring and alerts**
3. **Create customer support system**
4. **Plan marketing strategy**
5. **Scale based on user growth**

## 🆘 Troubleshooting

### Common Issues:
- **CORS errors:** Check server CORS configuration
- **Payment failures:** Verify Stripe keys are correct
- **Webhook errors:** Check webhook URL and secret
- **Server not starting:** Check PORT and environment variables

### Support:
- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** Available in your dashboard
- **Community:** Stack Overflow, GitHub Issues

---

**🎉 Congratulations!** Your recipe app now has a complete payment system that can generate real revenue. Start testing and watch your earnings grow! 