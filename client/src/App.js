import React, { useState } from 'react';
import { ChefHat, Plus, X, Clock, Users, TrendingUp, Sparkles, Heart, Star, Crown, Bookmark, Calendar, Calculator, Info } from 'lucide-react';
import axios from 'axios';

function App() {
  const [ingredients, setIngredients] = useState(['']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisine, setCuisine] = useState('any');
  const [difficulty, setDifficulty] = useState('medium');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [servings, setServings] = useState(4);
  const [recipeRatings, setRecipeRatings] = useState({});
  const [premiumFeatures, setPremiumFeatures] = useState({
    unlimitedRecipes: false,
    advancedScaling: false,
    mealPlanning: false,
    nutritionalInfo: false,
    recipeCollections: false,
    adFree: false
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Low-Carb', 'Keto', 'Paleo', 'Nut-Free'
  ];

  const cuisineOptions = [
    'any', 'Italian', 'Mexican', 'Asian', 'Indian', 
    'Mediterranean', 'American', 'French', 'Thai'
  ];

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const toggleDietaryRestriction = (restriction) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const generateRecipe = async () => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== '');
    
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      console.log('Making request to server...');
      const response = await axios.post('/api/generate-recipe', {
        ingredients: validIngredients,
        dietaryRestrictions,
        cuisine,
        difficulty,
        servings: isPremium ? servings : undefined
      });

      console.log('Recipe response:', response.data);
      console.log('Setting recipe state...');
      setRecipe(response.data);
      console.log('Recipe state should be updated');
    } catch (err) {
      console.error('Recipe generation error:', err);
      console.error('Error details:', err.message);
      setError(err.response?.data?.error || 'Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    const cardNumber = document.querySelector('input[placeholder="1234 5678 9012 3456"]')?.value;
    const cardExpiry = document.querySelector('input[placeholder="MM/YY"]')?.value;
    const cardCvv = document.querySelector('input[placeholder="123"]')?.value;
    const email = 'customer@example.com'; // You can add an email input field

    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill in all payment fields');
      return;
    }

    // Show loading state
    const payButton = document.querySelector('button[onclick="processPayment"]');
    const originalText = payButton?.textContent;
    if (payButton) {
      payButton.textContent = 'Processing...';
      payButton.disabled = true;
    }

    try {
      // Create payment method with Stripe
      const response = await axios.post('/api/create-subscription', {
        email: email,
        plan: selectedPlan,
        paymentMethodId: 'pm_card_visa' // In real app, this would be created by Stripe Elements
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Payment successful
      setIsPremium(true);
      setPremiumFeatures({
        unlimitedRecipes: true,
        advancedScaling: true,
        mealPlanning: true,
        nutritionalInfo: true,
        recipeCollections: true,
        adFree: true
      });
      setShowPaymentModal(false);
      
      // Save to localStorage
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('subscriptionId', response.data.subscriptionId);
      localStorage.setItem('customerId', response.data.customerId);
      
      alert('Payment successful! Welcome to Premium!');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      if (payButton) {
        payButton.textContent = originalText;
        payButton.disabled = false;
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        {/* Cute floating hearts */}
        <div className="absolute top-20 right-20">
          <Heart className="w-8 h-8 text-pink-400 cute-heart" />
        </div>
        <div className="absolute bottom-20 left-20">
          <Star className="w-6 h-6 text-rose-400 sparkle" />
        </div>
        <div className="absolute top-1/2 right-10">
          <Heart className="w-6 h-6 text-pink-300 cute-heart" style={{animationDelay: '0.5s'}} />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <ChefHat className="w-16 h-16 text-pink-500 mr-4 floating" />
              <div className="absolute inset-0 w-16 h-16 bg-pink-200 rounded-full blur-xl opacity-50"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Recipe Generator
            </h1>
            <div className="ml-4">
              <Heart className="w-8 h-8 text-pink-400 cute-heart" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            What's hiding in your kitchen? Let's turn those ingredients into something magical! ✨
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Premium Banner */}
          {!isPremium && (
            <div className="card p-6 mb-6 glass-effect border-2 border-gradient-to-r from-pink-200 to-rose-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Crown className="w-8 h-8 text-pink-500 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Upgrade to Premium</h3>
                    <p className="text-gray-600">Unlock advanced features like meal planning, recipe scaling, and more!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary px-6 py-2"
                >
                  Upgrade Now
                </button>
              </div>
              
              {/* Premium Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Calculator className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Recipe Scaling</span>
                </div>
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Meal Planning</span>
                </div>
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Info className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Nutritional Info</span>
                </div>
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Bookmark className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Recipe Collections</span>
                </div>
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Unlimited Recipes</span>
                </div>
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <Crown className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-sm font-medium">Ad-Free Experience</span>
                </div>
              </div>
            </div>
          )}

          {/* Premium Status */}
          {isPremium && (
            <div className="card p-4 mb-6 glass-effect border-2 border-pink-200">
              <div className="flex items-center justify-center">
                <Crown className="w-6 h-6 text-pink-500 mr-2" />
                <span className="text-lg font-bold text-pink-600">Premium Active</span>
                <div className="ml-4 flex gap-2">
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Unlimited</span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Ad-Free</span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Premium</span>
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="card p-8 mb-8 glass-effect">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
              What's in your kitchen? 🍳
              {isPremium && <span className="block text-lg text-pink-500 mt-2">✨ Premium Mode Active ✨</span>}
            </h2>

            {/* Ingredients */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                Ingredients (one per line) ✨
              </label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center mb-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="e.g., chicken breast, tomatoes, pasta..."
                    className="input-field flex-1 mr-3"
                  />
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-3 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addIngredient}
                className="btn-secondary flex items-center mt-4 mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Ingredient
              </button>
            </div>

            {/* Dietary Restrictions */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                Dietary Restrictions (optional) 💕
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietaryRestrictions.includes(option)}
                      onChange={() => toggleDietaryRestriction(option)}
                      className="mr-3 w-4 h-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine, Difficulty, and Servings */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                  Cuisine Style
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="input-field text-center"
                >
                  {cuisineOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'any' ? 'Any Cuisine' : option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field text-center"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              {isPremium && (
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                    <Calculator className="w-5 h-5 inline mr-2" />
                    Servings
                  </label>
                  <select
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                    className="input-field text-center"
                  >
                    <option value={2}>2 servings</option>
                    <option value={4}>4 servings</option>
                    <option value={6}>6 servings</option>
                    <option value={8}>8 servings</option>
                  </select>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateRecipe}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center py-4 text-xl font-bold pulse-glow"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Creating your recipe...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3" />
                  Generate Recipe
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Saved Recipes & Meal Plan */}
          {(savedRecipes.length > 0 || mealPlan.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {savedRecipes.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Bookmark className="w-6 h-6 mr-2 text-pink-500" />
                    Saved Recipes ({savedRecipes.length})
                  </h3>
                  <div className="space-y-3">
                    {savedRecipes.map((savedRecipe, index) => (
                      <div key={index} className="p-3 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800">{savedRecipe.title}</h4>
                        <p className="text-sm text-gray-600">{savedRecipe.cookingTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isPremium && mealPlan.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-pink-500" />
                    Meal Plan ({mealPlan.length})
                  </h3>
                  <div className="space-y-3">
                    {mealPlan.map((plannedRecipe, index) => (
                      <div key={index} className="p-3 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800">{plannedRecipe.title}</h4>
                        <p className="text-sm text-gray-600">{plannedRecipe.cookingTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <p>Recipe state: {recipe ? 'Recipe loaded' : 'No recipe'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Premium: {isPremium ? 'Yes' : 'No'}</p>
            <p>Servings: {servings}</p>
            <button 
              onClick={() => setRecipe({
                title: "Test Recipe",
                description: "This is a test recipe",
                ingredients: [{"item": "test", "amount": "1", "unit": "piece"}],
                instructions: ["Test instruction"],
                cookingTime: "10 minutes",
                servings: "2 servings",
                difficulty: "easy",
                calories: "100 calories per serving"
              })}
              className="btn-secondary px-4 py-2"
            >
              Test Recipe Display
            </button>
          </div>

          {/* Recipe Display */}
          {recipe && (
            <div className="card p-8 recipe-card">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-4xl font-bold text-gray-800 text-center bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex-1">
                    {recipe.title}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSavedRecipes([...savedRecipes, recipe])}
                      className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
                      title="Save Recipe"
                    >
                      <Bookmark className="w-6 h-6" />
                    </button>
                    {isPremium && (
                      <button 
                        onClick={() => setMealPlan([...mealPlan, recipe])}
                        className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
                        title="Add to Meal Plan"
                      >
                        <Calendar className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xl text-gray-600 mb-6 text-center leading-relaxed">
                  {recipe.description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-600 mb-8">
                  <div className="flex items-center bg-pink-50 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 mr-2 text-pink-500" />
                    <span className="font-semibold">{recipe.cookingTime}</span>
                  </div>
                  <div className="flex items-center bg-pink-50 px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 mr-2 text-pink-500" />
                    <span className="font-semibold">{isPremium ? `${servings} servings` : recipe.servings}</span>
                  </div>
                  <div className="flex items-center bg-pink-50 px-4 py-2 rounded-full">
                    <TrendingUp className="w-5 h-5 mr-2 text-pink-500" />
                    <span className="font-semibold capitalize">{recipe.difficulty}</span>
                  </div>
                  {isPremium && recipe.calories && (
                    <div className="flex items-center bg-pink-50 px-4 py-2 rounded-full">
                      <Info className="w-5 h-5 mr-2 text-pink-500" />
                      <span className="font-semibold">{recipe.calories}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Ingredients</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <div key={index} className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-4"></div>
                      <span className="font-bold text-gray-800">{ingredient.amount} {ingredient.unit}</span>
                      <span className="ml-3 text-gray-600 font-medium">{ingredient.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Instructions</h3>
                <div className="space-y-3">
                  {recipe.instructions?.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {recipe.tips && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Cooking Tips</h4>
                  <p className="text-yellow-700">{recipe.tips}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-4 mb-6">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === 'monthly' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setSelectedPlan('monthly')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Monthly Plan</h3>
                        <p className="text-gray-600">Perfect for trying out premium features</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600">$9.99</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === 'yearly' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setSelectedPlan('yearly')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Yearly Plan</h3>
                        <p className="text-gray-600">Best value - save 40%</p>
                        <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mt-1">
                          POPULAR
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600">$59.99</div>
                        <div className="text-sm text-gray-500">per year</div>
                        <div className="text-xs text-green-600">Save $59.89</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-pink-600">
                      {selectedPlan === 'monthly' ? '$9.99' : '$59.99'}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button 
                  onClick={processPayment}
                  className="btn-primary w-full py-3"
                >
                  Pay Now
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 