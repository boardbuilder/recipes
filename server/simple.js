const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.post('/api/generate-recipe', (req, res) => {
  console.log('Received request:', req.body);
  
  const recipe = {
    title: "Chicken Stir-Fry",
    description: "A quick and delicious stir-fry with vegetables and soy sauce",
    ingredients: [
      {"item": "chicken breast", "amount": "1", "unit": "pound"},
      {"item": "broccoli", "amount": "2", "unit": "cups"},
      {"item": "soy sauce", "amount": "3", "unit": "tablespoons"}
    ],
    instructions: [
      "Cut chicken into cubes",
      "Stir-fry chicken until golden",
      "Add vegetables and soy sauce",
      "Serve hot"
    ],
    cookingTime: "25 minutes",
    servings: "4 servings",
    difficulty: "medium",
    calories: "420 calories per serving",
    tips: "Use high heat for best results"
  };
  
  console.log('Sending recipe:', recipe.title);
  res.json(recipe);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 