import dotenv from 'dotenv';

dotenv.config();

// Indian foods database with nutritional information
const indianFoods = {
  vegetarian: {
    breakfast: [
      { name: 'Idli with Sambar', quantity: '4 idlis & 1 cup sambar', calories: 250, protein: 8, carbs: 40, fat: 5 },
      { name: 'Poha', quantity: '1 cup', calories: 270, protein: 6, carbs: 45, fat: 8 },
      { name: 'Dosa with Chutney', quantity: '1 medium & 2 tbsp chutney', calories: 200, protein: 5, carbs: 35, fat: 5 },
      { name: 'Upma', quantity: '1 cup', calories: 230, protein: 7, carbs: 32, fat: 9 },
      { name: 'Paneer Paratha', quantity: '2 medium', calories: 350, protein: 16, carbs: 38, fat: 15 },
      { name: 'Veg Sandwich', quantity: '2 slices', calories: 280, protein: 8, carbs: 30, fat: 12 },
      { name: 'Aloo Paratha with Curd', quantity: '2 parathas & 1/2 cup curd', calories: 380, protein: 10, carbs: 45, fat: 18 }
    ],
    snacks: [
      { name: 'Roasted Chana', quantity: '1/2 cup', calories: 120, protein: 7, carbs: 18, fat: 3 },
      { name: 'Sprouts Chaat', quantity: '1 cup', calories: 150, protein: 8, carbs: 20, fat: 2 },
      { name: 'Dhokla', quantity: '4 pieces', calories: 180, protein: 6, carbs: 22, fat: 7 },
      { name: 'Fruit Chaat', quantity: '1 cup', calories: 100, protein: 2, carbs: 25, fat: 0 },
      { name: 'Buttermilk', quantity: '1 glass', calories: 80, protein: 3, carbs: 5, fat: 2 },
      { name: 'Roasted Makhana', quantity: '1 cup', calories: 110, protein: 4, carbs: 18, fat: 1 }
    ],
    lunch: [
      { name: 'Dal Rice with Papad', quantity: '1 cup dal & 1 cup rice', calories: 450, protein: 15, carbs: 80, fat: 6 },
      { name: 'Chole Bhature', quantity: '1 cup chole & 2 bhature', calories: 550, protein: 20, carbs: 70, fat: 20 },
      { name: 'Rajma Chawal', quantity: '1 cup rajma & 1 cup rice', calories: 440, protein: 18, carbs: 75, fat: 5 },
      { name: 'Thali (Dal, Sabzi, Roti, Rice)', quantity: 'Regular serving', calories: 550, protein: 20, carbs: 85, fat: 15 },
      { name: 'Paneer Butter Masala with Roti', quantity: '1.5 cup & 3 rotis', calories: 630, protein: 25, carbs: 60, fat: 30 }
    ],
    dinner: [
      { name: 'Chapati with Vegetable Curry', quantity: '3 chapatis & 1 cup curry', calories: 400, protein: 15, carbs: 55, fat: 12 },
      { name: 'Palak Paneer with Roti', quantity: '1 cup & 2 rotis', calories: 450, protein: 22, carbs: 40, fat: 20 },
      { name: 'Khichdi with Vegetables', quantity: '1.5 cups', calories: 350, protein: 12, carbs: 60, fat: 5 },
      { name: 'Veg Pulao', quantity: '1.5 cups', calories: 380, protein: 10, carbs: 65, fat: 8 },
      { name: 'Roti with Mix Veg Curry', quantity: '3 rotis & 1 cup curry', calories: 420, protein: 15, carbs: 58, fat: 12 }
    ]
  },
  nonVegetarian: {
    breakfast: [
      { name: 'Egg Paratha', quantity: '2 parathas with 2 eggs', calories: 450, protein: 20, carbs: 42, fat: 22 },
      { name: 'Keema Paratha', quantity: '2 medium', calories: 480, protein: 22, carbs: 45, fat: 24 },
      { name: 'Egg Bhurji with Bread', quantity: '2 eggs & 2 slices', calories: 350, protein: 18, carbs: 28, fat: 18 },
      { name: 'Chicken Sandwich', quantity: '1 sandwich', calories: 320, protein: 20, carbs: 30, fat: 14 }
    ],
    snacks: [
      { name: 'Egg Chaat', quantity: '2 eggs', calories: 170, protein: 12, carbs: 6, fat: 12 },
      { name: 'Chicken Tikka', quantity: '4 pieces', calories: 200, protein: 25, carbs: 4, fat: 10 },
      { name: 'Fish Fingers', quantity: '6 pieces', calories: 230, protein: 18, carbs: 15, fat: 12 }
    ],
    lunch: [
      { name: 'Chicken Biryani', quantity: '1.5 cups', calories: 550, protein: 30, carbs: 65, fat: 20 },
      { name: 'Butter Chicken with Naan', quantity: '1 cup & 2 naan', calories: 650, protein: 35, carbs: 60, fat: 30 },
      { name: 'Fish Curry with Rice', quantity: '1 cup curry & 1 cup rice', calories: 480, protein: 28, carbs: 70, fat: 12 },
      { name: 'Mutton Curry with Roti', quantity: '1 cup & 3 rotis', calories: 600, protein: 38, carbs: 55, fat: 25 }
    ],
    dinner: [
      { name: 'Tandoori Chicken with Roti', quantity: '2 pieces & 2 rotis', calories: 450, protein: 35, carbs: 35, fat: 18 },
      { name: 'Egg Curry with Rice', quantity: '2 eggs, 1 cup curry & 1 cup rice', calories: 500, protein: 25, carbs: 65, fat: 15 },
      { name: 'Keema Matar with Roti', quantity: '1 cup & 3 rotis', calories: 520, protein: 30, carbs: 50, fat: 20 },
      { name: 'Chicken Tikka Masala with Naan', quantity: '1 cup & 1 naan', calories: 580, protein: 32, carbs: 45, fat: 25 }
    ]
  },
  vegan: {
    breakfast: [
      { name: 'Tofu Scramble', quantity: '1 cup', calories: 180, protein: 14, carbs: 10, fat: 10 },
      { name: 'Vegetable Poha', quantity: '1 cup', calories: 250, protein: 5, carbs: 45, fat: 7 },
      { name: 'Chickpea Flour Pancakes', quantity: '3 pancakes', calories: 300, protein: 12, carbs: 35, fat: 12 }
    ],
    snacks: [
      { name: 'Roasted Chickpeas', quantity: '1/2 cup', calories: 120, protein: 7, carbs: 18, fat: 3 },
      { name: 'Sprouts Salad', quantity: '1 cup', calories: 150, protein: 8, carbs: 20, fat: 2 },
      { name: 'Fruit Bowl', quantity: '1 cup mix', calories: 100, protein: 2, carbs: 25, fat: 0 }
    ],
    lunch: [
      { name: 'Lentil Soup with Rice', quantity: '1 cup soup & 1 cup rice', calories: 400, protein: 16, carbs: 75, fat: 4 },
      { name: 'Vegetable Pulao', quantity: '1.5 cups', calories: 350, protein: 8, carbs: 65, fat: 6 },
      { name: 'Pumpkin Curry with Roti', quantity: '1 cup & 3 rotis', calories: 420, protein: 10, carbs: 65, fat: 10 }
    ],
    dinner: [
      { name: 'Tofu and Vegetable Curry with Rice', quantity: '1 cup curry & 1 cup rice', calories: 420, protein: 18, carbs: 60, fat: 12 },
      { name: 'Quinoa Vegetable Bowl', quantity: '1.5 cups', calories: 350, protein: 12, carbs: 50, fat: 8 },
      { name: 'Vegetable Khichdi', quantity: '1.5 cups', calories: 320, protein: 10, carbs: 55, fat: 5 }
    ]
  },
  eggetarian: {
    breakfast: [
      { name: 'Egg Bhurji with Toast', quantity: '2 eggs & 2 slices', calories: 350, protein: 18, carbs: 28, fat: 18 },
      { name: 'Boiled Eggs with Paratha', quantity: '2 eggs & 2 parathas', calories: 450, protein: 20, carbs: 40, fat: 22 },
      { name: 'Vegetable Omelette', quantity: '2 egg omelette', calories: 280, protein: 16, carbs: 6, fat: 20 }
    ],
    snacks: [
      { name: 'Egg Chaat', quantity: '2 eggs', calories: 170, protein: 12, carbs: 6, fat: 12 },
      { name: 'Boiled Egg Sandwich', quantity: '1 sandwich (2 slices)', calories: 250, protein: 15, carbs: 25, fat: 10 }
    ],
    lunch: [
      { name: 'Egg Curry with Rice', quantity: '2 eggs, 1 cup curry & 1 cup rice', calories: 500, protein: 25, carbs: 65, fat: 15 },
      { name: 'Egg Fried Rice', quantity: '1.5 cups', calories: 450, protein: 20, carbs: 60, fat: 14 },
      { name: 'Vegetable Thali with Egg', quantity: 'Thali + 1 egg', calories: 580, protein: 25, carbs: 75, fat: 18 }
    ],
    dinner: [
      { name: 'Egg Masala with Roti', quantity: '2 eggs & 3 rotis', calories: 480, protein: 24, carbs: 50, fat: 18 },
      { name: 'Egg Pulao', quantity: '1.5 cups', calories: 400, protein: 18, carbs: 55, fat: 12 },
      { name: 'Egg Kofta Curry with Roti', quantity: '1 cup & 3 rotis', calories: 520, protein: 22, carbs: 55, fat: 20 }
    ]
  }
};

// Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
function calculateBMR(gender, weight, height, age) {
  if (gender === 'Male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate Total Daily Energy Expenditure (TDEE)
function calculateTDEE(bmr, activityLevel) {
  const activityMultipliers = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extremely Active': 1.9
  };
  return bmr * activityMultipliers[activityLevel];
}

// Calculate target calories based on fitness goal
function calculateTargetCalories(tdee, fitnessGoal) {
  switch (fitnessGoal) {
    case 'Weight Loss':
      return tdee - 500; // 500 calorie deficit
    case 'Weight Gain':
      return tdee + 500; // 500 calorie surplus
    case 'Muscle Building':
      return tdee + 300; // 300 calorie surplus
    default:
      return tdee; // Maintenance or General Fitness
  }
}

// Calculate macronutrient distribution based on fitness goal
function calculateMacros(targetCalories, fitnessGoal) {
  let protein, carbs, fat;
  
  switch (fitnessGoal) {
    case 'Weight Loss':
      protein = (targetCalories * 0.4) / 4; // 40% protein (4 calories per gram)
      fat = (targetCalories * 0.3) / 9;     // 30% fat (9 calories per gram)
      carbs = (targetCalories * 0.3) / 4;   // 30% carbs (4 calories per gram)
      break;
    case 'Weight Gain':
      protein = (targetCalories * 0.25) / 4; // 25% protein
      fat = (targetCalories * 0.25) / 9;     // 25% fat
      carbs = (targetCalories * 0.5) / 4;    // 50% carbs
      break;
    case 'Muscle Building':
      protein = (targetCalories * 0.35) / 4; // 35% protein
      fat = (targetCalories * 0.25) / 9;     // 25% fat
      carbs = (targetCalories * 0.4) / 4;    // 40% carbs
      break;
    default: // Maintenance or General Fitness
      protein = (targetCalories * 0.3) / 4;  // 30% protein
      fat = (targetCalories * 0.3) / 9;      // 30% fat
      carbs = (targetCalories * 0.4) / 4;    // 40% carbs
  }
  
  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
}

// Generate diet plan using user preferences and calculated nutrition needs
async function generateDietPlan(profile) {
  try {
    // Calculate nutritional requirements
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, profile.fitnessGoal);
    const macros = calculateMacros(targetCalories, profile.fitnessGoal);
    
    // Distribute calories across meals
    const mealDistribution = {
      'Breakfast': 0.25,
      'Mid-Morning Snack': 0.1,
      'Lunch': 0.35,
      'Evening Snack': 0.1,
      'Dinner': 0.2
    };
    
    // Get appropriate food list based on dietary preference
    let foodList;
    switch (profile.dietaryPreference) {
      case 'Vegetarian':
        foodList = indianFoods.vegetarian;
        break;
      case 'Non-Vegetarian':
        foodList = { ...indianFoods.vegetarian, ...indianFoods.nonVegetarian };
        break;
      case 'Vegan':
        foodList = indianFoods.vegan;
        break;
      case 'Eggetarian':
        foodList = { ...indianFoods.vegetarian, ...indianFoods.eggetarian };
        break;
      default:
        foodList = indianFoods.vegetarian;
    }
    
    // Filter foods based on allergies
    const allergies = profile.allergies || [];
    if (allergies.length > 0) {
      // Create a regex pattern for all allergies
      const allergyPattern = new RegExp(allergies.join('|'), 'i');
      
      // Filter food options to exclude allergens
      for (const mealType in foodList) {
        foodList[mealType] = foodList[mealType].filter(food => 
          !allergyPattern.test(food.name)
        );
      }
    }
    
    // Static guidelines based on profile
    let guidelines = [
      `Your daily calorie target is ${Math.round(targetCalories)} calories.`,
      `Protein: ${macros.protein}g | Carbs: ${macros.carbs}g | Fat: ${macros.fat}g`,
      'Stay hydrated by drinking at least 8 glasses of water daily.',
      'Space your meals evenly throughout the day.',
      'Include a variety of colorful fruits and vegetables in your diet.'
    ];
    
    // Add static guidelines based on medical conditions
    if (profile.medicalConditions && profile.medicalConditions.length > 0) {
      if (profile.medicalConditions.includes('Diabetes')) {
        guidelines.push('Limit simple carbohydrates and focus on low glycemic index foods.');
        guidelines.push('Monitor your blood sugar regularly, especially when starting this new diet plan.');
      }
      if (profile.medicalConditions.includes('Hypertension')) {
        guidelines.push('Limit sodium intake to less than 2,300mg per day.');
        guidelines.push('Emphasize foods rich in potassium, calcium, and magnesium.');
      }
      if (profile.medicalConditions.includes('Cholesterol')) {
        guidelines.push('Limit saturated and trans fats in your diet.');
        guidelines.push('Include sources of omega-3 fatty acids and soluble fiber.');
      }
      if (profile.medicalConditions.includes('Thyroid')) {
        guidelines.push('Consume adequate iodine from sources like iodized salt and seafood.');
        guidelines.push('Limit cruciferous vegetables if you have hypothyroidism.');
      }
    }
    
    // Add allergy-specific guidelines
    if (allergies.length > 0) {
      guidelines.push(`Your diet plan excludes foods containing: ${allergies.join(', ')}.`);
      guidelines.push('Always check food labels for potential allergens.');
    }
    
    // Add guidelines based on fitness goal
    if (profile.fitnessGoal === 'Weight Loss') {
      guidelines.push('Focus on creating a calorie deficit through diet and exercise.');
      guidelines.push('Prioritize protein to maintain muscle mass during weight loss.');
    } else if (profile.fitnessGoal === 'Weight Gain') {
      guidelines.push('Eat calorie-dense foods to ensure you reach your daily calorie target.');
      guidelines.push('Consider eating more frequent meals if you struggle with large portions.');
    } else if (profile.fitnessGoal === 'Muscle Building') {
      guidelines.push('Consume protein within 30 minutes after strength training.');
      guidelines.push('Distribute protein intake evenly throughout the day for optimal muscle synthesis.');
    }
    
    // Generate a 7-day meal plan
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealPlan = [];
    
    for (const day of daysOfWeek) {
      const dayPlan = {
        day: day,
        meals: []
      };
      
      // Generate meals for each meal type
      for (const [mealType, caloriePercentage] of Object.entries(mealDistribution)) {
        const mealCalories = targetCalories * caloriePercentage;
        let items = [];
        let totalCalories = 0;
        
        // Select appropriate foods for this meal type
        let foodOptions;
        if (mealType === 'Breakfast') {
          foodOptions = foodList.breakfast || [];
        } else if (mealType === 'Lunch') {
          foodOptions = foodList.lunch || [];
        } else if (mealType === 'Dinner') {
          foodOptions = foodList.dinner || [];
        } else {
          foodOptions = foodList.snacks || [];
        }
        
        // Ensure we have food options, use default vegetarian if not
        if (foodOptions.length === 0) {
          console.log(`No foods available for ${mealType} in ${profile.dietaryPreference} preference. Using vegetarian options.`);
          
          if (mealType === 'Breakfast') {
            foodOptions = indianFoods.vegetarian.breakfast;
          } else if (mealType === 'Lunch') {
            foodOptions = indianFoods.vegetarian.lunch;
          } else if (mealType === 'Dinner') {
            foodOptions = indianFoods.vegetarian.dinner;
          } else {
            foodOptions = indianFoods.vegetarian.snacks;
          }
        }
        
        // Randomize food selection for variety but ensure we include at least 1-2 items
        const shuffledFoods = [...foodOptions].sort(() => 0.5 - Math.random());
        
        // Make sure we include at least 1 item even if it exceeds the calories
        if (shuffledFoods.length > 0) {
          const firstItem = shuffledFoods[0];
          items.push({
            name: firstItem.name,
            quantity: firstItem.quantity,
            calories: firstItem.calories
          });
          totalCalories += firstItem.calories;
        }
        
        // Add more items if needed to reach calorie target
        for (let i = 1; i < shuffledFoods.length; i++) {
          const food = shuffledFoods[i];
          
          // Only add more if we haven't reached our target calories
          if (totalCalories < mealCalories * 0.8) {
            items.push({
              name: food.name,
              quantity: food.quantity,
              calories: food.calories
            });
            
            totalCalories += food.calories;
          } else {
            break;
          }
        }
        
        dayPlan.meals.push({
          type: mealType,
          items: items,
          totalCalories: totalCalories
        });
      }
      
      mealPlan.push(dayPlan);
    }
    
    // Create the complete diet plan
    return {
      weekNumber: 1, // Start with week 1
      dailyCalories: Math.round(targetCalories),
      proteinGrams: macros.protein,
      carbsGrams: macros.carbs,
      fatGrams: macros.fat,
      mealPlan: mealPlan,
      guidelines: guidelines
    };
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw new Error('Failed to generate diet plan: ' + error.message);
  }
}

export {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  generateDietPlan
}; 