
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recipe Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbbf24 100%);
        }
        .btn-primary {
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 4px;
            transition: all 0.3s;
            transform: scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .input-field {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #fce7f3;
            border-radius: 4px;
            outline: none;
            transition: all 0.2s;
            background: rgba(255, 255, 255, 0.9);
        }
        .input-field:focus {
            ring: 2px;
            ring-color: #ec4899;
            border-color: transparent;
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 4px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid #fce7f3;
        }
        .recipe-card {
            animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .ingredient-tag {
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .step-number {
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">🍳 Recipe Generator</h1>
            <p class="text-gray-600">Enter your ingredients and get delicious recipes!</p>
            
            <!-- Premium Banner -->
            <div id="premium-banner" class="card p-4 mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200 relative">
                <div class="absolute top-2 right-2 text-xs text-gray-500 font-bold">P</div>
                <div class="flex items-center justify-center gap-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">Upgrade to Premium</h3>
                        <p class="text-sm text-gray-600">Unlock advanced features and unlimited recipes!</p>
                    </div>
                    <button onclick="showPremiumModal()" class="btn-primary px-4 py-2 text-sm">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>

        <!-- Input Form -->
        <div class="card p-6 mb-6">
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Ingredients:</label>
                <div id="ingredients-container">
                    <div class="flex gap-2 mb-2">
                        <input type="text" class="input-field flex-1" placeholder="Enter an ingredient..." id="ingredient-0">
                        <button onclick="addIngredient()" class="btn-primary">+</button>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Dietary Restrictions:</label>
                <div class="flex flex-wrap gap-2">
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-2" value="vegetarian"> Vegetarian
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-2" value="vegan"> Vegan
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-2" value="gluten-free"> Gluten-Free
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" class="mr-2" value="dairy-free"> Dairy-Free
                    </label>
                </div>
            </div>

            <button onclick="generateRecipe()" class="btn-primary w-full py-3">
                Generate Recipe
            </button>
        </div>

        <!-- Recipe Display -->
        <div id="recipe-display" class="hidden">
            <div class="card p-8 recipe-card">
                <h2 id="recipe-title" class="text-3xl font-bold text-gray-800 mb-4"></h2>
                <p id="recipe-description" class="text-gray-600 mb-6"></p>
                
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Ingredients:</h3>
                        <ul id="recipe-ingredients" class="space-y-2"></ul>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Instructions:</h3>
                        <ol id="recipe-instructions" class="space-y-3"></ol>
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div class="flex items-center">
                        <span class="font-semibold">⏱️ Cooking Time:</span>
                        <span id="cooking-time" class="ml-2"></span>
                    </div>
                    <div class="flex items-center">
                        <span class="font-semibold">👥 Servings:</span>
                        <span id="servings" class="ml-2"></span>
                    </div>
                    <div class="flex items-center">
                        <span class="font-semibold">🔥 Calories:</span>
                        <span id="calories" class="ml-2"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Facebook Pixel Code -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1958412844735395');
        fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=1958412844735395&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Facebook Pixel Code -->

    <!-- Stripe.js -->
    <script src="https://js.stripe.com/v3/"></script>
    <script>
        // Initialize Stripe
        const stripe = Stripe('pk_live_51QGR3EDYRm11DoRiF412084WDjELauYMAvVDQ3W1pHL05fLavgUQeUm9MwrtDhRLEeRTB3NfnqHAwHtt2vf0MTVp00QRkSfv5x');
        let elements;
        let cardElement;
        
        let ingredientCount = 1;

        function addIngredient() {
            const container = document.getElementById('ingredients-container');
            const newDiv = document.createElement('div');
            newDiv.className = 'flex gap-2 mb-2';
            newDiv.innerHTML = `
                <input type="text" class="input-field flex-1" placeholder="Enter an ingredient..." id="ingredient-${ingredientCount}">
                <button onclick="removeIngredient(this)" class="btn-primary">-</button>
            `;
            container.appendChild(newDiv);
            ingredientCount++;
        }

        function removeIngredient(button) {
            button.parentElement.remove();
        }

        function generateRecipe() {
            const ingredients = [];
            for (let i = 0; i < ingredientCount; i++) {
                const input = document.getElementById(`ingredient-${i}`);
                if (input && input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            }

            if (ingredients.length === 0) {
                alert('Please add at least one ingredient!');
                return;
            }

            // Get dietary restrictions
            const restrictions = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                restrictions.push(cb.value);
            });

            // Generate recipe based on ingredients
            const recipe = generateRecipeFromIngredients(ingredients, restrictions);
            displayRecipe(recipe);
        }

        function generateRecipeFromIngredients(ingredients, restrictions) {
            const recipes = {
                'chicken': {
                    title: 'Chicken Stir-Fry',
                    description: 'A quick and delicious stir-fry with vegetables and soy sauce',
                    ingredients: [
                        { item: 'chicken breast', amount: '1', unit: 'pound' },
                        { item: 'broccoli', amount: '2', unit: 'cups' },
                        { item: 'soy sauce', amount: '3', unit: 'tablespoons' },
                        { item: 'garlic', amount: '3', unit: 'cloves' },
                        { item: 'ginger', amount: '1', unit: 'tablespoon' }
                    ],
                    instructions: [
                        'Cut chicken into bite-sized pieces',
                        'Heat oil in a large wok or skillet',
                        'Stir-fry chicken until golden brown',
                        'Add garlic and ginger, cook for 1 minute',
                        'Add broccoli and stir-fry for 3 minutes',
                        'Add soy sauce and cook for 2 more minutes',
                        'Serve hot with rice'
                    ],
                    cookingTime: '25 minutes',
                    servings: '4 servings',
                    calories: '420 calories per serving'
                },
                'beef': {
                    title: 'Beef Tacos',
                    description: 'Flavorful ground beef tacos with fresh toppings',
                    ingredients: [
                        { item: 'ground beef', amount: '1', unit: 'pound' },
                        { item: 'taco seasoning', amount: '1', unit: 'packet' },
                        { item: 'tortillas', amount: '8', unit: 'pieces' },
                        { item: 'lettuce', amount: '1', unit: 'head' },
                        { item: 'tomatoes', amount: '2', unit: 'medium' }
                    ],
                    instructions: [
                        'Brown ground beef in a large skillet',
                        'Add taco seasoning and water according to packet',
                        'Simmer for 5 minutes until thickened',
                        'Warm tortillas in a dry skillet',
                        'Assemble tacos with beef and toppings',
                        'Serve with salsa and sour cream'
                    ],
                    cookingTime: '20 minutes',
                    servings: '4 servings',
                    calories: '380 calories per serving'
                },
                'salmon': {
                    title: 'Baked Salmon',
                    description: 'Simple and healthy baked salmon with herbs',
                    ingredients: [
                        { item: 'salmon fillets', amount: '4', unit: 'pieces' },
                        { item: 'lemon', amount: '1', unit: 'whole' },
                        { item: 'olive oil', amount: '2', unit: 'tablespoons' },
                        { item: 'dill', amount: '2', unit: 'tablespoons' },
                        { item: 'salt and pepper', amount: 'to taste', unit: '' }
                    ],
                    instructions: [
                        'Preheat oven to 400°F (200°C)',
                        'Place salmon on a baking sheet',
                        'Drizzle with olive oil and lemon juice',
                        'Sprinkle with dill, salt, and pepper',
                        'Bake for 12-15 minutes',
                        'Serve with steamed vegetables'
                    ],
                    cookingTime: '15 minutes',
                    servings: '4 servings',
                    calories: '280 calories per serving'
                },
                'pasta': {
                    title: 'Creamy Pasta',
                    description: 'Rich and creamy pasta with parmesan cheese',
                    ingredients: [
                        { item: 'pasta', amount: '1', unit: 'pound' },
                        { item: 'heavy cream', amount: '1', unit: 'cup' },
                        { item: 'parmesan cheese', amount: '1', unit: 'cup' },
                        { item: 'garlic', amount: '3', unit: 'cloves' },
                        { item: 'butter', amount: '2', unit: 'tablespoons' }
                    ],
                    instructions: [
                        'Cook pasta according to package directions',
                        'Melt butter in a large skillet',
                        'Add minced garlic and cook for 1 minute',
                        'Add cream and simmer for 3 minutes',
                        'Stir in parmesan cheese until melted',
                        'Add cooked pasta and toss to coat',
                        'Serve with extra parmesan on top'
                    ],
                    cookingTime: '20 minutes',
                    servings: '4 servings',
                    calories: '450 calories per serving'
                }
            };

            // Try to find a matching recipe
            for (const ingredient of ingredients) {
                const lowerIngredient = ingredient.toLowerCase();
                for (const [key, recipe] of Object.entries(recipes)) {
                    if (lowerIngredient.includes(key)) {
                        return recipe;
                    }
                }
            }

            // Fallback recipe
            return {
                title: 'Simple Stir-Fry',
                description: 'A versatile stir-fry using your available ingredients',
                ingredients: [
                    { item: ingredients[0], amount: '2', unit: 'cups' },
                    { item: 'vegetables', amount: '2', unit: 'cups' },
                    { item: 'soy sauce', amount: '2', unit: 'tablespoons' },
                    { item: 'oil', amount: '2', unit: 'tablespoons' },
                    { item: 'garlic', amount: '2', unit: 'cloves' }
                ],
                instructions: [
                    'Heat oil in a large wok or skillet',
                    'Add minced garlic and cook for 30 seconds',
                    'Add your main ingredient and stir-fry for 3 minutes',
                    'Add vegetables and cook for 2 more minutes',
                    'Add soy sauce and cook for 1 minute',
                    'Serve hot with rice or noodles'
                ],
                cookingTime: '15 minutes',
                servings: '2 servings',
                calories: '300 calories per serving'
            };
        }

        function displayRecipe(recipe) {
            document.getElementById('recipe-title').textContent = recipe.title;
            document.getElementById('recipe-description').textContent = recipe.description;
            
            // Display ingredients
            const ingredientsList = document.getElementById('recipe-ingredients');
            ingredientsList.innerHTML = '';
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.className = 'flex items-center';
                li.innerHTML = `
                    <span class="ingredient-tag mr-2">${ingredient.amount} ${ingredient.unit}</span>
                    <span class="text-gray-700">${ingredient.item}</span>
                `;
                ingredientsList.appendChild(li);
            });

            // Display instructions
            const instructionsList = document.getElementById('recipe-instructions');
            instructionsList.innerHTML = '';
            recipe.instructions.forEach((instruction, index) => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-3';
                li.innerHTML = `
                    <div class="step-number">${index + 1}</div>
                    <span class="text-gray-700">${instruction}</span>
                `;
                instructionsList.appendChild(li);
            });

            // Display cooking info
            document.getElementById('cooking-time').textContent = recipe.cookingTime;
            document.getElementById('servings').textContent = recipe.servings;
            document.getElementById('calories').textContent = recipe.calories;

            // Show the recipe
            document.getElementById('recipe-display').classList.remove('hidden');
            document.getElementById('recipe-display').scrollIntoView({ behavior: 'smooth' });
        }

        // Premium functionality
        let isPremium = false;
        let selectedPlan = 'monthly';

        function showPremiumModal() {
            document.getElementById('premium-modal').classList.remove('hidden');
        }

        function hidePremiumModal() {
            document.getElementById('premium-modal').classList.add('hidden');
        }

        function selectPlan(plan) {
            selectedPlan = plan;
            const price = plan === 'monthly' ? '$9.99' : '$79.99';
            document.getElementById('plan-price').textContent = price;
            document.getElementById('payment-form').classList.remove('hidden');
            
            // Initialize Stripe Elements if not already done
            if (!elements) {
                elements = stripe.elements();
                cardElement = elements.create('card', {
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                    },
                });
                cardElement.mount('#card-element');
                
                // Handle validation errors
                cardElement.on('change', function(event) {
                    const displayError = document.getElementById('card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });
            }
        }

        function processPayment() {
            const email = document.getElementById('customer-email').value;

            if (!email) {
                alert('Please enter your email address');
                return;
            }

            // Show loading state
            const payButton = document.querySelector('button[onclick="processPayment()"]');
            const originalText = payButton.textContent;
            payButton.textContent = 'Processing...';
            payButton.disabled = true;

            // Create payment method with Stripe Elements
            stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    email: email,
                },
            }).then(function(result) {
                if (result.error) {
                    // Show error to customer
                    const errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                    payButton.textContent = originalText;
                    payButton.disabled = false;
                } else {
                    // Send payment method ID to server
                    fetch('http://localhost:3001/api/create-subscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            plan: selectedPlan,
                            paymentMethodId: result.paymentMethod.id
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) {
                            throw new Error(data.error);
                        }
                        
                        // Payment successful - track with Facebook Pixel
                        fbq('track', 'Purchase', {
                            value: selectedPlan === 'monthly' ? 9.99 : 79.99,
                            currency: 'USD',
                            content_name: 'Recipe Generator Premium',
                            content_category: 'Subscription'
                        });
                        
                        // Update local storage
                        isPremium = true;
                        localStorage.setItem('isPremium', 'true');
                        localStorage.setItem('subscriptionId', data.subscriptionId);
                        localStorage.setItem('customerId', data.customerId);
                        
                        hidePremiumModal();
                        document.getElementById('premium-banner').classList.add('hidden');
                        
                        alert('Payment successful! Welcome to Premium!');
                    })
                    .catch(error => {
                        console.error('Payment error:', error);
                        alert('Payment failed: ' + error.message);
                    })
                    .finally(() => {
                        payButton.textContent = originalText;
                        payButton.disabled = false;
                    });
                }
            });
        }
    </script>

    <!-- Premium Modal -->
    <div id="premium-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Upgrade to Premium</h2>
                <button onclick="hidePremiumModal()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Choose Your Plan</h3>
                
                <div class="space-y-4">
                    <div 
                        class="p-4 border-2 rounded-lg cursor-pointer transition-all border-pink-500 bg-pink-50"
                        onclick="selectPlan('monthly')"
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-lg">Monthly Plan</h3>
                                <p class="text-gray-600">Perfect for trying out premium features</p>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-pink-600">$9.99</div>
                                <div class="text-sm text-gray-500">per month</div>
                            </div>
                        </div>
                    </div>

                    <div 
                        class="p-4 border-2 rounded-lg cursor-pointer transition-all border-gray-200 hover:border-pink-300"
                        onclick="selectPlan('yearly')"
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-lg">Yearly Plan</h3>
                                <p class="text-gray-600">Best value - save 40%</p>
                                <span class="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mt-1">
                                    POPULAR
                                </span>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-pink-600">$79.99</div>
                                <div class="text-sm text-gray-500">per year</div>
                                <div class="text-xs text-green-600">Save $39.89</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="payment-form" class="hidden mt-6">
                    <h3 class="text-lg font-semibold mb-4">Payment Details</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                            <div id="card-element" class="input-field p-3 min-h-[40px]"></div>
                            <div id="card-errors" class="text-red-500 text-sm mt-2"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                id="customer-email"
                                placeholder="john@example.com"
                                class="input-field"
                            />
                        </div>
                    </div>

                    <div class="border-t pt-4 mt-6">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">Total:</span>
                            <span class="text-xl font-bold text-pink-600" id="plan-price">$9.99</span>
                        </div>
                    </div>

                    <button 
                        onclick="processPayment()"
                        class="btn-primary w-full py-3 mt-6"
                    >
                        Pay Now
                    </button>

                    <p class="text-xs text-gray-500 text-center mt-4">
                        Secure payment powered by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 