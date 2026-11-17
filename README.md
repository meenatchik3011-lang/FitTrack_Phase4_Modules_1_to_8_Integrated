# FitTrack – Fitness & Workout Management Platform

A full-stack fitness management platform built with **FastAPI, React, and SQLite**. FitTrack helps users manage workouts, track fitness progress, set goals, monitor nutrition, receive personalized recommendations, and connect with fitness and healthcare professionals.

---

## Project Overview

**Project Name:** FitTrack  
**Project Type:** Fitness & Workout Management Platform  
**Backend:** Python – FastAPI  
**Frontend:** React – Vite  
**Database:** SQLite  
**Authentication:** JWT  
**Password Security:** bcrypt  
**Data Validation:** Pydantic  

### Main Objectives

- Manage user registration and authentication.
- Create, manage, and schedule workouts.
- Track daily fitness progress.
- Set and monitor fitness goals.
- Analyze workout performance.
- Track workout streaks and achievements.
- Manage diet plans and daily nutrition.
- Track water intake.
- Generate personalized workout and diet recommendations.
- Manage subscriptions and consultations.
- Send notifications and reminders.
- Book and manage doctor appointments.

---

# Project Phases & Modules

## PHASE 1 – FITNESS TRACKING PLATFORM

Phase 1 focuses on the core fitness management functionality.

### Module 1 – User Authentication

**Features:**
- User registration.
- User login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected API routes.
- User-specific data access.

**Users Table:**
- id
- username
- email
- hashed_password
- created_at

### Module 2 – Workout Management

**Features:**
- Add workouts.
- View workout history.
- Update workout details.
- Delete workouts.
- Categorize workouts.
- Track workout duration.
- Calculate calories burned.

**Workout Categories:**
- Cardio
- Strength
- Yoga

**Workout Fields:**
- workout_name
- category
- duration
- calories_burned
- workout_date
- created_at

### Module 3 – Daily Progress Tracking

**Features:**
- Track daily fitness progress.
- Record fitness measurements.
- View progress history.
- Monitor improvements over time.
- Display progress information on the dashboard.

### Module 4 – Goal Setting

**Features:**
- Create fitness goals.
- Set target values.
- Track goal progress.
- Update goals.
- Monitor completed and pending goals.

### Module 5 – Reports & Analytics

**Features:**
- Workout performance reports.
- Calories burned analysis.
- Daily and weekly progress.
- Fitness statistics.
- Progress charts and visualizations.

### Module 6 – Notifications System

**Features:**
- Display user notifications.
- Notify users about fitness activities.
- Show notification counts.
- Manage notification status.
- Provide updates about fitness progress.

---

## PHASE 2 – ADVANCED TRACKING & USER ENGAGEMENT

Phase 2 introduces advanced fitness tracking, workout planning, and user engagement features.

### Module 7 – Workout Plans & Scheduling

**Features:**
- Create workout plans.
- Schedule workouts.
- View upcoming workouts.
- Manage workout schedules.
- Display workout plans in a planner or calendar.

**Workout_Plans Table:**
- id
- user_id
- title
- description
- scheduled_date
- created_at

### Module 8 – Exercise Library

**Features:**
- View available exercises.
- Add exercises.
- Search exercises.
- Filter by exercise category.
- Display exercise descriptions and duration.

**Exercises Table:**
- id
- name
- category
- description
- duration

### Module 9 – Progress Comparison

**Features:**
- Compare weekly progress.
- Compare monthly progress.
- Display fitness improvement trends.
- Analyze workout performance.
- Show progress charts and insights.

### Module 10 – Streak Tracking System

**Features:**
- Track consecutive workout days.
- Display current workout streak.
- Track longest workout streak.
- Update streak after workouts.
- Reset streak when the streak condition is broken.

**Streak Table:**
- id
- user_id
- current_streak
- longest_streak
- last_workout_date

### Module 11 – Achievement Badges

**Features:**
- Award achievement badges.
- Track user achievements.
- Display earned badges.
- Encourage consistent workout activity.

**Badges Table:**
- id
- name
- description
- icon

**User_Badges Table:**
- id
- user_id
- badge_id
- earned_at

### Module 12 – Personalized Dashboard

**Features:**
- Display personalized fitness information.
- Show workout statistics.
- Display fitness goals.
- Show progress summaries.
- Display workout streaks.
- Show achievements and notifications.

---

## PHASE 3 – ADVANCED FITNESS TRACKING & INTELLIGENCE

Phase 3 extends FitTrack with nutrition tracking, hydration monitoring, workout assistance, integrations, analytics, and reminders.

### Module 13 – Nutrition & Meal Tracking

**Features:**
- Add daily meals.
- Track calories.
- Track protein, carbohydrates, and fats.
- View meal history.
- Update meal details.
- Delete meal records.
- Display nutrition summaries.

**Meals Table:**
- id
- user_id
- meal_type
- food_name
- calories
- protein
- carbs
- fats
- created_at

### Module 14 – Water Intake Tracker

**Features:**
- Record daily water intake.
- Set daily water goals.
- Track consumed water.
- Display hydration progress.
- View daily water intake history.

**Water_Tracking Table:**
- id
- user_id
- water_amount
- recorded_at

### Module 15 – AI Workout Suggestions

**Features:**
- Generate workout suggestions.
- Recommend workouts based on fitness goals.
- Consider workout categories.
- Provide personalized fitness suggestions.

*Note: Recommendations can use rule-based logic; they should not be represented as machine-learning predictions unless a trained model is integrated.*

### Module 16 – Workout Timer & Live Tracking

**Features:**
- Start workout timer.
- Pause workout timer.
- Resume workout timer.
- Stop workout timer.
- Track workout duration.
- Estimate calories burned.

*Note: Calorie calculations are estimates, not medical measurements.*

### Module 17 – Third-Party Integration

**Features:**
- Support integration with external fitness services.
- Import supported fitness information.
- Connect external fitness data with FitTrack.
- Provide an integration interface.

*Note: Actual synchronization depends on the external provider and its API or import support.*

### Module 18 – Advanced Analytics Dashboard

**Features:**
- Display fitness analytics.
- Analyze workout performance.
- Track calories burned.
- Compare fitness progress.
- Display weekly and monthly statistics.
- Present fitness trends through charts.

### Module 19 – In-App Reminders & Alerts

**Features:**
- Create meal reminders.
- Create workout reminders.
- Create water intake reminders.
- View reminder notifications.
- Check reminders that are due.
- Display reminder alerts.

*Note: Reminder delivery depends on the implemented due-check mechanism; background or push delivery requires an additional scheduler or notification service.*

---

## PHASE 4 – ADVANCED HEALTH, NUTRITION & CONSULTATION MANAGEMENT

Phase 4 introduces diet management, subscription services, nutritionist consultations, personalized diet recommendations, notifications, and doctor appointments.

### Module 1 – User Authentication

**Features:**
- Register users.
- Login users.
- Authenticate API requests.
- Secure user accounts.
- Manage user-specific access.

### Module 2 – Diet Plans Management

**Features:**
- View available diet plans.
- Assign diet plans to users.
- View the current assigned diet plan.
- Manage diet plan information.

**Demo Diet Plans:**

| Diet Plan | Goal | Daily Calories |
|---|---|---:|
| Balanced Weight Management | Weight Loss | 1800 kcal |
| Strength & Muscle Support | Muscle Gain | 2400 kcal |
| Healthy Maintenance | Maintenance | 2000 kcal |

### Module 3 – Meal & Nutrition Tracking

**Features:**
- Add meals.
- Edit meal details.
- Delete meals.
- View meal history.
- Track calories.
- Track protein, carbohydrates, and fats.
- Display nutrition summaries.

### Module 4 – Subscription Plans

**Features:**
- View available subscription plans.
- Select a subscription.
- Subscribe to a plan.
- View current subscription details.
- Check subscription status.

**Demo Subscription Categories:**
- Free
- Premium
- Pro

*Note: Subscription functionality is a demonstration workflow and does not represent real payment processing unless a payment gateway is integrated.*

### Module 5 – Nutritionist Consultation System

**Features:**
- View available nutritionists.
- Book nutritionist consultations.
- View consultation history.
- Display consultation details.
- Check consultation status.
- Apply subscription-based access rules.

### Module 6 – Diet Recommendations (Basic AI Logic)

**Features:**
- Generate diet recommendations.
- Select fitness goals.
- Enter daily calorie requirements.
- Generate recommendations based on user goals.
- Display recommended calorie values.
- Support weight loss, muscle gain, and maintenance goals.

*Note: This module uses basic recommendation logic, not a clinically validated AI or medical diagnosis system.*

### Module 7 – Notifications & Reminders

**Features:**
- View notifications.
- Generate health alerts.
- Display subscription expiry reminders.
- Display nutritionist consultation reminders.
- Display doctor appointment reminders.
- Prevent duplicate alerts for the same reminder.

### Module 8 – Doctor Support & Consultation

**Features:**
- View doctor directory.
- View doctor details.
- Check doctor availability.
- Book doctor appointments.
- View appointment history.
- Edit appointments.
- Cancel appointments.
- Delete appointments.
- Track appointment status.

**Appointment Status:**
- PENDING
- CANCELLED

---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- JWT Authentication
- bcrypt
- Uvicorn

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Axios / Fetch API

## Development Tools

- Visual Studio Code
- Python Virtual Environment
- Node.js
- npm
- Git
- GitHub
- Swagger UI

---

# Project Structure

```text
FitTrack/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── auth.py
│   │   ├── services.py
│   │   └── phase4.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── fittrack.db
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Phase4.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   └── pages/
│   │
│   ├── package.json
│   └── index.html
│
└── README.md
```

*The structure above is a representative overview. Keep any additional files and folders already present in your actual project.*

---

# Installation & Setup

## Prerequisites

Install the following:

- Python
- Node.js and npm
- Visual Studio Code
- Git

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FitTrack
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

## 2. Backend Setup

Open a terminal:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Configure the environment variables using the project's `.env.example` file. Keep secret keys and credentials private.

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API Documentation:

```text
http://127.0.0.1:8000/docs
```

## 3. Frontend Setup

Open a second terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# API Overview

The following are key API routes used across the project. Refer to Swagger UI for the complete list of registered endpoints.

## Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |

## Diet Plans

| Method | Endpoint |
|---|---|
| GET | `/api/diet-plans` |
| POST | `/api/diet-plans/assign` |
| GET | `/api/diet-plans/my/current` |

## Meal & Nutrition

| Method | Endpoint |
|---|---|
| GET | `/api/nutrition/meals` |
| POST | `/api/nutrition/meals` |
| GET | `/api/nutrition/summary` |

## Subscriptions

| Method | Endpoint |
|---|---|
| GET | `/api/subscriptions` |
| GET | `/api/subscriptions/current` |
| POST | `/api/subscriptions/subscribe/{subscription_id}` |

## Nutritionist Consultations

| Method | Endpoint |
|---|---|
| GET | `/api/nutritionists` |
| POST | `/api/consultations` |
| GET | `/api/consultations` |

## Diet Recommendations

| Method | Endpoint |
|---|---|
| POST | `/api/diet-recommendations` |

## Notifications & Health Alerts

| Method | Endpoint |
|---|---|
| GET | `/api/notifications` |
| POST | `/api/health-alerts/generate` |

## Doctor Support & Appointments

| Method | Endpoint |
|---|---|
| GET | `/api/doctors` |
| GET | `/api/doctors/{doctor_id}` |
| POST | `/api/appointments` |
| GET | `/api/appointments` |
| PUT | `/api/appointments/{appointment_id}` |
| PATCH | `/api/appointments/{appointment_id}/cancel` |
| DELETE | `/api/appointments/{appointment_id}` |

---

# Database Overview

FitTrack uses SQLite and SQLAlchemy for database management.

Main database entities include:

- Users
- Workouts
- Progress
- Goals
- Notifications
- Workout_Plans
- Exercises
- Streak
- Badges
- User_Badges
- Meals
- Water_Tracking
- Diet Plans
- Subscriptions
- Nutritionists
- Consultations
- Doctors
- Appointments

The database stores user information, fitness activity, nutrition records, subscription information, and consultation details.

**Important:** Back up the existing database before making schema or migration changes. Do not delete the existing database when updating application code.

---

# Testing Checklist

## Phase 1

- [ ] Register a new user.
- [ ] Login with valid credentials.
- [ ] Add a workout.
- [ ] Edit and delete a workout.
- [ ] Track daily progress.
- [ ] Create fitness goals.
- [ ] View reports and analytics.
- [ ] Check notifications.

## Phase 2

- [ ] Create workout plans.
- [ ] Schedule workouts.
- [ ] View exercise library.
- [ ] Search and filter exercises.
- [ ] Compare weekly and monthly progress.
- [ ] Check workout streaks.
- [ ] Verify achievement badges.
- [ ] Check personalized dashboard.

## Phase 3

- [ ] Add and manage meals.
- [ ] Track water intake.
- [ ] Generate workout suggestions.
- [ ] Test workout timer.
- [ ] Test supported integrations.
- [ ] View advanced analytics.
- [ ] Create and check reminders.

## Phase 4

- [ ] Register and login.
- [ ] View diet plans.
- [ ] Assign a diet plan.
- [ ] Add and manage meals.
- [ ] Subscribe to a demo plan.
- [ ] Book a nutritionist consultation.
- [ ] Generate diet recommendations.
- [ ] Generate and view health alerts.
- [ ] View doctor directory.
- [ ] Book a doctor appointment.
- [ ] Edit an appointment.
- [ ] Cancel an appointment.
- [ ] Delete an appointment.

---

# Security Considerations

- Passwords should be stored as secure hashes.
- Protected endpoints should validate JWT tokens.
- User-specific records should be checked for ownership.
- Validate incoming API data using Pydantic.
- Store secret keys and credentials in environment variables.
- Do not commit `.env` files or database credentials to GitHub.
- Use HTTPS and production security settings when deploying.

---

# Future Enhancements

- Real-time fitness device integration.
- Advanced AI-based workout recommendations.
- AI-powered nutrition analysis.
- Online payment gateway integration.
- Google Fit and Apple Health integration.
- Push notifications.
- Video consultations.
- Cloud database and production deployment.
- Mobile application support.

---

# Conclusion

FitTrack is a full-stack fitness and health management platform developed across four phases.

It combines workout management, fitness analytics, nutrition tracking, hydration monitoring, personalized recommendations, subscription management, reminders, and healthcare consultation features.

The project demonstrates full-stack development using FastAPI, React, SQLite, REST APIs, JWT authentication, and modern web technologies.

---

**Project:** FitTrack – Fitness & Workout Management Platform  
**Backend:** FastAPI  
**Frontend:** React + Vite  
**Database:** SQLite  
**Version:** Phase 1 – Phase 4
