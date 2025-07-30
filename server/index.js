const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;

// Middleware
app.use(cors());
app.use(express.json());

// Stripe payment endpoints
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', plan } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency,
      metadata: {
        plan: plan,
        customer_email: req.body.email || 'anonymous'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/create-subscription', async (req, res) => {
  try {
    const { email, paymentMethodId, plan } = req.body;
    
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

    // Define subscription prices based on plan
    const prices = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID
    };

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: prices[plan] }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ 
      message: 'Subscription cancelled successfully',
      subscription: subscription 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

app.get('/api/subscription-status/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length > 0) {
      res.json({
        isActive: true,
        subscription: subscriptions.data[0]
      });
    } else {
      res.json({
        isActive: false,
        subscription: null
      });
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Webhook to handle Stripe events
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
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
    case 'invoice.payment_succeeded':
      const paymentSucceeded = event.data.object;
      console.log('Payment succeeded for subscription:', paymentSucceeded.subscription);
      // Update user's premium status in your database
      break;
    case 'invoice.payment_failed':
      const paymentFailed = event.data.object;
      console.log('Payment failed for subscription:', paymentFailed.subscription);
      // Handle failed payment
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log('Subscription cancelled:', subscriptionDeleted.id);
      // Remove user's premium status
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Recipe generation endpoint
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { ingredients, dietaryRestrictions = [], cuisine = 'any', difficulty = 'medium', servings } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one ingredient' });
    }

    console.log('Received ingredients:', ingredients);
    console.log('Dietary restrictions:', dietaryRestrictions);
    console.log('Cuisine:', cuisine);
    console.log('Difficulty:', difficulty);
    console.log('Servings:', servings);

    // Real recipe database
    const recipeDatabase = {
      'chicken': [
        {
          title: "Chicken Stir-Fry",
          description: "A quick and delicious stir-fry with vegetables and soy sauce - perfect for a weeknight dinner",
          ingredients: [
            {"item": "chicken breast", "amount": "1", "unit": "pound (about 2 large breasts)"},
            {"item": "broccoli", "amount": "2", "unit": "cups (1 medium head)"},
            {"item": "carrots", "amount": "2", "unit": "medium (sliced into matchsticks)"},
            {"item": "soy sauce", "amount": "3", "unit": "tablespoons (low-sodium recommended)"},
            {"item": "garlic", "amount": "3", "unit": "cloves (minced)"},
            {"item": "fresh ginger", "amount": "1", "unit": "tablespoon (minced)"},
            {"item": "vegetable oil", "amount": "2", "unit": "tablespoons (peanut or canola oil)"},
            {"item": "cornstarch", "amount": "1", "unit": "teaspoon"},
            {"item": "sesame oil", "amount": "1", "unit": "teaspoon (optional)"},
            {"item": "green onions", "amount": "2", "unit": "stalks (chopped)"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "PREP WORK: Cut chicken breast into 1-inch cubes. Season generously with salt and pepper. Set aside.",
            "VEGETABLE PREP: Cut broccoli into small florets. Peel and slice carrots into thin matchsticks. Mince garlic and ginger finely.",
            "SAUCE MIX: In a small bowl, combine soy sauce, 1/4 cup water, and cornstarch. Stir until smooth.",
            "HEAT WOK: Place a large wok or deep skillet over high heat. Add vegetable oil and heat until smoking hot (about 2 minutes).",
            "COOK CHICKEN: Add chicken pieces in a single layer. Let cook undisturbed for 2 minutes, then stir-fry for 3-4 minutes until golden brown and cooked through. Remove chicken to a plate.",
            "SAUTÉ AROMATICS: In the same wok, add garlic and ginger. Stir-fry for 30 seconds until fragrant (be careful not to burn).",
            "ADD VEGETABLES: Add broccoli and carrots. Stir-fry for 4-5 minutes until vegetables are bright green and tender-crisp.",
            "COMBINE: Return chicken to wok. Pour in sauce mixture and stir to coat everything evenly.",
            "FINAL TOUCHES: Cook for 2 more minutes until sauce thickens. Stir in sesame oil and green onions.",
            "SERVE: Transfer to serving dish and serve immediately over steamed rice. Garnish with extra green onions if desired."
          ],
          cookingTime: "25 minutes (plus 10 minutes prep)",
          servings: "4 servings (about 1.5 cups per person)",
          difficulty: "medium",
          calories: "420 calories per serving",
          tips: "Mise en place is crucial - have everything prepped before starting. Use high heat and don't overcrowd the pan. The key to great stir-fry is cooking in batches and keeping the heat high."
        },
        {
          title: "Baked Chicken Parmesan",
          description: "Crispy breaded chicken topped with marinara and melted cheese - a restaurant-quality dish made at home",
          ingredients: [
            {"item": "chicken breast", "amount": "4", "unit": "pieces (6-8 oz each)"},
            {"item": "panko breadcrumbs", "amount": "1", "unit": "cup (Japanese-style for extra crunch)"},
            {"item": "parmesan cheese", "amount": "1/2", "unit": "cup (freshly grated)"},
            {"item": "marinara sauce", "amount": "2", "unit": "cups (homemade or quality store-bought)"},
            {"item": "mozzarella cheese", "amount": "1", "unit": "cup (shredded, whole milk preferred)"},
            {"item": "eggs", "amount": "2", "unit": "large (beaten)"},
            {"item": "all-purpose flour", "amount": "1/2", "unit": "cup"},
            {"item": "dried oregano", "amount": "1", "unit": "teaspoon"},
            {"item": "dried basil", "amount": "1", "unit": "teaspoon"},
            {"item": "garlic powder", "amount": "1/2", "unit": "teaspoon"},
            {"item": "olive oil", "amount": "2", "unit": "tablespoons"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "PREHEAT OVEN: Set oven to 400°F (200°C). Line a large baking sheet with parchment paper or foil for easy cleanup.",
            "PREP CHICKEN: Place chicken breasts between two sheets of plastic wrap. Using a meat mallet or rolling pin, pound to even 1/2-inch thickness. Season both sides generously with salt and pepper.",
            "SET UP BREADING STATION: Arrange three shallow bowls: 1) Flour mixed with garlic powder, 2) Beaten eggs with 1 tablespoon water, 3) Panko breadcrumbs mixed with parmesan, oregano, and basil.",
            "BREAD CHICKEN: Working with one piece at a time: First, dredge in flour mixture, shaking off excess. Then dip in egg mixture, letting excess drip off. Finally, press into breadcrumb mixture, ensuring full coverage. Place on prepared baking sheet.",
            "BAKE FIRST ROUND: Drizzle each chicken piece with 1/2 tablespoon olive oil. Bake for 20 minutes until golden brown and internal temperature reaches 165°F (74°C).",
            "ADD TOPPINGS: Remove from oven. Spoon 1/2 cup marinara sauce over each chicken piece, spreading evenly. Top with shredded mozzarella cheese.",
            "FINAL BAKE: Return to oven for 8-10 minutes until cheese is melted and bubbly, and sauce is heated through.",
            "REST AND SERVE: Let chicken rest for 5 minutes before serving. This allows juices to redistribute and prevents dryness.",
            "GARNISH: Sprinkle with fresh basil or parsley if desired. Serve with additional marinara sauce on the side.",
            "SIDE SUGGESTIONS: Serve with spaghetti, garlic bread, or a simple green salad."
          ],
          cookingTime: "40 minutes (plus 15 minutes prep)",
          servings: "4 servings (1 chicken breast per person)",
          difficulty: "medium",
          calories: "580 calories per serving",
          tips: "Use a meat thermometer to ensure chicken reaches 165°F. Let chicken rest after baking to keep it juicy. For extra crispiness, broil for 1-2 minutes at the end. Freshly grated parmesan melts better than pre-shredded."
        }
      ],
      'tomatoes': [
        {
          title: "Fresh Tomato Basil Pasta",
          description: "A simple and flavorful pasta highlighting fresh tomatoes and basil - perfect summer dish",
          ingredients: [
            {"item": "pasta", "amount": "1", "unit": "pound (spaghetti, linguine, or penne)"},
            {"item": "tomatoes", "amount": "6", "unit": "large (ripe, preferably Roma or vine-ripened)"},
            {"item": "garlic", "amount": "4", "unit": "cloves (minced)"},
            {"item": "extra virgin olive oil", "amount": "1/4", "unit": "cup (plus extra for drizzling)"},
            {"item": "fresh basil", "amount": "1/2", "unit": "cup (torn, plus extra for garnish)"},
            {"item": "parmesan cheese", "amount": "1/2", "unit": "cup (freshly grated)"},
            {"item": "red pepper flakes", "amount": "1/4", "unit": "teaspoon (optional)"},
            {"item": "kosher salt", "amount": "2", "unit": "tablespoons (for pasta water)"},
            {"item": "black pepper", "amount": "to taste", "unit": ""},
            {"item": "pasta water", "amount": "1", "unit": "cup (reserved)"}
          ],
          instructions: [
            "BOIL WATER: Fill a large pot with 4-6 quarts of water. Add 2 tablespoons kosher salt and bring to a rolling boil over high heat.",
            "PREP TOMATOES: While water heats, core and dice tomatoes into 1/2-inch pieces. Place in a large bowl and season with 1/2 teaspoon salt. Let sit for 10 minutes to draw out juices.",
            "PREP GARLIC: Mince garlic cloves finely. Set aside in a small bowl.",
            "COOK PASTA: Add pasta to boiling water and cook according to package directions until al dente (usually 8-10 minutes). Reserve 1 cup of pasta water before draining.",
            "HEAT OIL: In a large skillet, heat olive oil over medium heat until shimmering (about 2 minutes).",
            "SAUTÉ GARLIC: Add minced garlic and red pepper flakes. Cook, stirring constantly, for 30-45 seconds until fragrant but not browned.",
            "ADD TOMATOES: Add diced tomatoes with their juices to the skillet. Increase heat to medium-high and cook, stirring occasionally, for 5-7 minutes until tomatoes break down and release their liquid.",
            "SEASON SAUCE: Season tomato mixture with salt and pepper to taste. The sauce should be slightly chunky but saucy.",
            "COMBINE: Add hot, drained pasta to the skillet. Toss gently to coat pasta with tomato sauce.",
            "ADD FINISHING TOUCHES: Stir in torn basil leaves and 1/4 cup parmesan cheese. If sauce seems dry, add reserved pasta water 1/4 cup at a time until desired consistency.",
            "SERVE: Transfer to serving bowls. Top with remaining parmesan cheese, extra basil leaves, and a drizzle of olive oil. Serve immediately while hot."
          ],
          cookingTime: "25 minutes (plus 10 minutes prep)",
          servings: "4 servings (about 2 cups per person)",
          difficulty: "easy",
          calories: "380 calories per serving",
          tips: "Use the best quality tomatoes you can find - they're the star of this dish. Don't skip salting the tomatoes - it draws out their natural juices. Reserve pasta water - it's the secret to perfect pasta sauce consistency. Fresh basil should be added at the very end to preserve its bright flavor."
        },
        {
          title: "Tomato Soup",
          description: "Creamy homemade tomato soup perfect for any day",
          ingredients: [
            {"item": "tomatoes", "amount": "8", "unit": "large"},
            {"item": "onion", "amount": "1", "unit": "medium"},
            {"item": "garlic", "amount": "3", "unit": "cloves"},
            {"item": "heavy cream", "amount": "1/2", "unit": "cup"},
            {"item": "butter", "amount": "2", "unit": "tablespoons"},
            {"item": "vegetable broth", "amount": "4", "unit": "cups"},
            {"item": "basil", "amount": "1/4", "unit": "cup"}
          ],
          instructions: [
            "Preheat oven to 400°F (200°C)",
            "Cut tomatoes in half and place on baking sheet",
            "Add halved onion and garlic cloves",
            "Drizzle with olive oil and roast for 30 minutes",
            "Transfer roasted vegetables to large pot",
            "Add vegetable broth and bring to simmer",
            "Cook for 15 minutes, then blend until smooth",
            "Stir in heavy cream and butter",
            "Season with salt and pepper",
            "Garnish with fresh basil"
          ],
          cookingTime: "45 minutes",
          servings: "6 servings",
          difficulty: "easy",
          calories: "180 calories per serving",
          tips: "Roasting the tomatoes first adds incredible depth of flavor"
        }
      ],
      'pasta': [
        {
          title: "Creamy Garlic Pasta",
          description: "Rich and creamy pasta with garlic and parmesan cheese",
          ingredients: [
            {"item": "pasta", "amount": "1", "unit": "pound"},
            {"item": "heavy cream", "amount": "2", "unit": "cups"},
            {"item": "parmesan cheese", "amount": "1", "unit": "cup"},
            {"item": "garlic", "amount": "6", "unit": "cloves"},
            {"item": "butter", "amount": "4", "unit": "tablespoons"},
            {"item": "parsley", "amount": "1/4", "unit": "cup"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "Cook pasta in salted water until al dente",
            "Meanwhile, melt butter in large skillet over medium heat",
            "Add minced garlic and sauté until fragrant",
            "Pour in heavy cream and bring to simmer",
            "Stir in parmesan cheese until melted and smooth",
            "Add cooked pasta and toss to coat",
            "Season with salt and pepper",
            "Garnish with chopped parsley",
            "Serve immediately while hot"
          ],
          cookingTime: "15 minutes",
          servings: "4 servings",
          difficulty: "easy",
          calories: "650 calories per serving",
          tips: "Reserve 1 cup of pasta water to adjust sauce consistency if needed"
        },
        {
          title: "Pasta Primavera",
          description: "Colorful pasta with fresh spring vegetables",
          ingredients: [
            {"item": "pasta", "amount": "1", "unit": "pound"},
            {"item": "broccoli", "amount": "2", "unit": "cups"},
            {"item": "carrots", "amount": "2", "unit": "medium"},
            {"item": "zucchini", "amount": "2", "unit": "medium"},
            {"item": "bell peppers", "amount": "2", "unit": "medium"},
            {"item": "olive oil", "amount": "3", "unit": "tablespoons"},
            {"item": "garlic", "amount": "4", "unit": "cloves"},
            {"item": "parmesan cheese", "amount": "1/2", "unit": "cup"}
          ],
          instructions: [
            "Bring large pot of salted water to boil",
            "Cook pasta until al dente, reserving 1 cup pasta water",
            "Meanwhile, cut all vegetables into similar-sized pieces",
            "Heat olive oil in large skillet over medium-high heat",
            "Add garlic and sauté for 30 seconds",
            "Add vegetables and stir-fry for 5-7 minutes",
            "Add cooked pasta and 1/2 cup pasta water",
            "Toss to combine and heat through",
            "Stir in parmesan cheese",
            "Season with salt and pepper and serve"
          ],
          cookingTime: "25 minutes",
          servings: "4 servings",
          difficulty: "medium",
          calories: "320 calories per serving",
          tips: "Cut vegetables into uniform pieces for even cooking"
        }
      ],
      'beef': [
        {
          title: "Beef Stir-Fry",
          description: "Quick and flavorful beef stir-fry with vegetables",
          ingredients: [
            {"item": "beef", "amount": "1", "unit": "pound"},
            {"item": "broccoli", "amount": "2", "unit": "cups"},
            {"item": "soy sauce", "amount": "3", "unit": "tablespoons"},
            {"item": "garlic", "amount": "3", "unit": "cloves"},
            {"item": "ginger", "amount": "1", "unit": "tablespoon"},
            {"item": "vegetable oil", "amount": "2", "unit": "tablespoons"},
            {"item": "cornstarch", "amount": "1", "unit": "teaspoon"}
          ],
          instructions: [
            "Slice beef into thin strips",
            "Heat oil in wok or large skillet over high heat",
            "Add beef and stir-fry for 2-3 minutes until browned",
            "Add garlic and ginger, stir-fry for 30 seconds",
            "Add broccoli and stir-fry for 3-4 minutes",
            "Mix soy sauce and cornstarch, add to wok",
            "Cook until sauce thickens",
            "Serve hot over rice"
          ],
          cookingTime: "20 minutes",
          servings: "4 servings",
          difficulty: "medium",
          calories: "450 calories per serving",
          tips: "Use high heat for authentic stir-fry texture"
        }
      ],
      'salmon': [
        {
          title: "Baked Salmon",
          description: "Simple and delicious baked salmon with herbs",
          ingredients: [
            {"item": "salmon", "amount": "4", "unit": "fillets (6 oz each)"},
            {"item": "olive oil", "amount": "2", "unit": "tablespoons"},
            {"item": "lemon", "amount": "1", "unit": "sliced"},
            {"item": "dill", "amount": "2", "unit": "tablespoons"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "Preheat oven to 400°F (200°C)",
            "Place salmon on baking sheet",
            "Drizzle with olive oil and season with salt and pepper",
            "Top with lemon slices and dill",
            "Bake for 12-15 minutes until flaky",
            "Serve immediately"
          ],
          cookingTime: "15 minutes",
          servings: "4 servings",
          difficulty: "easy",
          calories: "280 calories per serving",
          tips: "Don't overcook - salmon should be slightly pink in center"
        }
      ],
      'eggs': [
        {
          title: "Scrambled Eggs",
          description: "Perfect fluffy scrambled eggs",
          ingredients: [
            {"item": "eggs", "amount": "6", "unit": "large"},
            {"item": "butter", "amount": "2", "unit": "tablespoons"},
            {"item": "milk", "amount": "2", "unit": "tablespoons"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "Crack eggs into bowl and whisk with milk",
            "Season with salt and pepper",
            "Melt butter in non-stick pan over medium heat",
            "Pour in egg mixture",
            "Stir gently with spatula until eggs are set",
            "Serve immediately"
          ],
          cookingTime: "10 minutes",
          servings: "3 servings",
          difficulty: "easy",
          calories: "200 calories per serving",
          tips: "Don't over-stir - let eggs set slightly before stirring"
        }
      ],
      'rice': [
        {
          title: "Fried Rice",
          description: "Classic fried rice with vegetables and protein",
          ingredients: [
            {"item": "rice", "amount": "3", "unit": "cups (cooked)"},
            {"item": "eggs", "amount": "2", "unit": "large"},
            {"item": "vegetables", "amount": "2", "unit": "cups (mixed)"},
            {"item": "soy sauce", "amount": "2", "unit": "tablespoons"},
            {"item": "sesame oil", "amount": "1", "unit": "teaspoon"},
            {"item": "garlic", "amount": "2", "unit": "cloves"}
          ],
          instructions: [
            "Heat oil in large wok or skillet",
            "Scramble eggs and remove from pan",
            "Add vegetables and stir-fry for 2-3 minutes",
            "Add rice and stir-fry for 3-4 minutes",
            "Return eggs to pan",
            "Add soy sauce and sesame oil",
            "Stir-fry for 1 minute more",
            "Serve hot"
          ],
          cookingTime: "15 minutes",
          servings: "4 servings",
          difficulty: "easy",
          calories: "300 calories per serving",
          tips: "Use day-old rice for best texture"
        }
      ],
      'potatoes': [
        {
          title: "Roasted Potatoes",
          description: "Crispy roasted potatoes with herbs",
          ingredients: [
            {"item": "potatoes", "amount": "2", "unit": "pounds"},
            {"item": "olive oil", "amount": "3", "unit": "tablespoons"},
            {"item": "garlic", "amount": "4", "unit": "cloves"},
            {"item": "rosemary", "amount": "2", "unit": "sprigs"},
            {"item": "salt and pepper", "amount": "to taste", "unit": ""}
          ],
          instructions: [
            "Preheat oven to 425°F (220°C)",
            "Cut potatoes into 1-inch cubes",
            "Toss with olive oil, garlic, rosemary, salt, and pepper",
            "Spread on baking sheet in single layer",
            "Roast for 25-30 minutes until golden and crispy",
            "Serve hot"
          ],
          cookingTime: "35 minutes",
          servings: "4 servings",
          difficulty: "easy",
          calories: "250 calories per serving",
          tips: "Don't overcrowd the baking sheet - potatoes need space to crisp up"
        }
      ],
      'onions': [
        {
          title: "Caramelized Onions",
          description: "Sweet and savory caramelized onions",
          ingredients: [
            {"item": "onions", "amount": "4", "unit": "large (sliced thin)"},
            {"item": "butter", "amount": "2", "unit": "tablespoons"},
            {"item": "olive oil", "amount": "2", "unit": "tablespoons"},
            {"item": "salt", "amount": "1/2", "unit": "teaspoon"},
            {"item": "sugar", "amount": "1", "unit": "teaspoon (optional)"}
          ],
          instructions: [
            "Slice onions thinly",
            "Heat butter and oil in large skillet over medium-low heat",
            "Add onions and salt, stir to coat",
            "Cook slowly for 30-40 minutes, stirring occasionally",
            "Add sugar if desired for extra sweetness",
            "Continue cooking until deep golden brown",
            "Serve as topping or side dish"
          ],
          cookingTime: "45 minutes",
          servings: "4 servings",
          difficulty: "easy",
          calories: "120 calories per serving",
          tips: "Low and slow is the key - don't rush the caramelization process"
        }
      ]
    };

    // Find a recipe based on ingredients
    let selectedRecipe = null;
    let matchedIngredients = [];
    
    console.log('Available recipe keys:', Object.keys(recipeDatabase));
    
    for (const ingredient of ingredients) {
      const lowerIngredient = ingredient.toLowerCase();
      console.log('Checking ingredient:', lowerIngredient);
      if (recipeDatabase[lowerIngredient]) {
        matchedIngredients.push(lowerIngredient);
        console.log('Found match for:', lowerIngredient);
      }
    }
    
    // If we have matched ingredients, select a recipe
    if (matchedIngredients.length > 0) {
      // Get the first matched ingredient's recipes
      const recipes = recipeDatabase[matchedIngredients[0]];
      console.log('Found recipes for:', matchedIngredients[0], 'Count:', recipes.length);
      // Select a random recipe from the available options
      const randomIndex = Math.floor(Math.random() * recipes.length);
      selectedRecipe = recipes[randomIndex];
      console.log('Selected recipe:', selectedRecipe.title);
      
      // Apply dietary restrictions
      if (dietaryRestrictions.includes('Vegetarian') || dietaryRestrictions.includes('Vegan')) {
        // Filter out non-vegetarian recipes or modify existing ones
        if (selectedRecipe.title.includes('Chicken') || selectedRecipe.title.includes('Beef') || selectedRecipe.title.includes('Salmon')) {
          selectedRecipe.title = selectedRecipe.title.replace('Chicken', 'Tofu').replace('Beef', 'Tempeh').replace('Salmon', 'Tofu');
          selectedRecipe.description = selectedRecipe.description.replace('chicken', 'tofu').replace('beef', 'tempeh').replace('salmon', 'tofu');
        }
      }
      
      // Apply servings adjustment for premium users
      if (servings && servings !== 4) {
        const originalServings = 4; // Default servings
        const multiplier = servings / originalServings;
        
        // Adjust ingredients based on servings
        selectedRecipe.ingredients = selectedRecipe.ingredients.map(ingredient => {
          const newIngredient = { ...ingredient };
          if (ingredient.amount && !isNaN(ingredient.amount)) {
            const originalAmount = parseFloat(ingredient.amount);
            const newAmount = (originalAmount * multiplier).toFixed(1);
            newIngredient.amount = newAmount;
          }
          return newIngredient;
        });
        
        // Update servings display
        selectedRecipe.servings = `${servings} servings`;
        console.log(`Adjusted recipe for ${servings} servings`);
      }
    } else {
      // If no specific recipe found, create a custom recipe
      console.log('No specific recipe found, creating custom recipe for:', ingredients);
      selectedRecipe = {
        title: `${ingredients.join(', ')} Recipe`,
        description: `A delicious recipe using ${ingredients.join(', ')} - perfect for using what you have on hand`,
        ingredients: ingredients.map(ing => ({"item": ing, "amount": "1", "unit": "portion"})),
        instructions: [
          "PREP INGREDIENTS: Wash and prepare all your ingredients",
          "CHOOSE METHOD: Decide on your cooking method - sauté, roast, or stir-fry",
          "COOK: Heat oil in a pan and cook ingredients until tender",
          "SEASON: Add salt, pepper, and your favorite herbs and spices",
          "SERVE: Plate your dish and enjoy your creation!"
        ],
        cookingTime: "20-30 minutes",
        servings: "2-4 servings",
        difficulty: difficulty,
        calories: "250-350 calories per serving",
        tips: "Feel free to adjust ingredients and seasonings to your taste. This is a flexible recipe that works with any ingredients you have!"
      };
    }

    console.log('Sending recipe:', selectedRecipe.title);
    res.json(selectedRecipe);

  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe. Please try again.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recipe Generator API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 