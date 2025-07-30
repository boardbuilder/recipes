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
            border-radius: 8px;
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
            border-radius: 8px;
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
            border-radius: 8px;
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

    <script>
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
    </script>
</body>
</html> 