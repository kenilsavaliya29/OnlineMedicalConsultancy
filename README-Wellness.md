# Wellness Program Feature

The Wellness Program is a comprehensive health management system that allows users to track their health information and receive personalized diet plans based on their profile data. This feature leverages AI to provide tailored nutritional recommendations.

## Features

- **Wellness Profile Creation**: Users can create detailed health profiles including:
  - Basic information (height, weight, age, gender)
  - Medical conditions and allergies
  - Dietary preferences (Vegetarian, Non-Vegetarian, Vegan, Eggetarian)
  - Fitness goals and activity levels

- **Personalized Diet Plans**: 
  - AI-generated meal plans based on user profile
  - Calculation of daily calorie needs, macronutrient distribution
  - Support for various dietary preferences
  - Special guidelines for medical conditions

- **Diet Plan History**: 
  - Track progress with weekly diet plans
  - View and compare previous plans

## Technical Implementation

### Backend Components

1. **Models**:
   - `wellnessSchema.js`: Defines MongoDB schemas for wellness profiles and diet plans

2. **Controllers**:
   - `wellnessController.js`: Handles CRUD operations for wellness profiles and diet plans

3. **Routes**:
   - `wellnessRoutes.js`: Defines API endpoints for the wellness program

4. **Utilities**:
   - `dietGenerator.js`: Contains business logic for generating diet plans, including:
     - BMR and TDEE calculations
     - Indian food database
     - OpenAI integration for personalized recommendations

### Frontend Components

1. **Pages**:
   - `WellnessProgram.jsx`: Main container component with routing for wellness sections

2. **Components**:
   - `WellnessProfile.jsx`: Form for creating and updating wellness profiles
   - `DietPlan.jsx`: Displays generated diet plans with meal details

3. **Integration**:
   - Added to main application router
   - Accessible from patient dashboard

## API Endpoints

- `POST /api/wellness/profile`: Create new wellness profile
- `PUT /api/wellness/profile`: Update existing wellness profile
- `GET /api/wellness/profile`: Retrieve user's wellness profile
- `POST /api/wellness/diet-plan`: Generate new diet plan
- `GET /api/wellness/diet-plan/history`: Get history of diet plans
- `GET /api/wellness/diet-plan/:weekNumber`: Get specific diet plan by week number

## AI Integration

The system integrates with OpenAI to generate personalized dietary guidelines, especially for users with specific medical conditions. When OpenAI API key is configured, the system will use AI to enhance diet recommendations.

### Setup OpenAI Integration

1. Get an API key from OpenAI (https://platform.openai.com/)
2. Add to your backend `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Future Enhancements

- Progress tracking and visualization
- Workout plan integration
- Recipe suggestions
- Grocery list generation
- Goal achievement tracking 