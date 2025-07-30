# Recipe Generator App

An AI-powered recipe generator that creates delicious recipes based on the ingredients you have in your kitchen!

## Features

- 🍳 **AI-Powered Recipe Generation**: Uses OpenAI to create unique recipes from your ingredients
- 🥗 **Dietary Restrictions**: Support for vegetarian, vegan, gluten-free, and more
- 🌍 **Cuisine Styles**: Choose from various cuisine types or let AI decide
- ⚡ **Difficulty Levels**: Easy, medium, or hard recipes
- 📱 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🎯 **Smart Suggestions**: AI suggests substitutes for missing ingredients

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **AI**: OpenAI GPT-3.5-turbo
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Get an OpenAI API key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file

### Running the Application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

**Or run separately:**

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## How to Use

1. **Enter your ingredients**: Add the ingredients you have in your kitchen
2. **Set preferences**: Choose dietary restrictions, cuisine style, and difficulty level
3. **Generate recipe**: Click the "Generate Recipe" button
4. **Follow the recipe**: Get detailed instructions, cooking time, and tips!

## API Endpoints

- `POST /api/generate-recipe` - Generate a recipe from ingredients
- `GET /api/health` - Health check endpoint

## Project Structure

```
recipe-generator-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main app component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Tailwind styles
│   └── package.json
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── package.json           # Root package.json
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes. 