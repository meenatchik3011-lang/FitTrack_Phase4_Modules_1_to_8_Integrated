# FitTrack — Fitness, Nutrition & Diet Management Platform

FitTrack retains the existing Phase 1–3 application (Modules 1–19) and adds Phase 4 (Modules 1–8) in the same project folder, database, authentication flow, and React frontend.

## Project structure

```text
FitTrack/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── database.py
│   │   └── phase4.py
│   ├── .env.example
│   ├── requirements.txt
│   └── fittrack.db
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Phase3.jsx
│   │   ├── Phase4.jsx
│   │   ├── api.js
│   │   └── ...
│   └── package.json
└── README.md
```

## Important database and privacy note

The supplied archive contained a populated `backend/fittrack.db` (1 user, 11 workouts, 4 goals, plus Phase 3 data). This ZIP carries that database forward so the old records can remain available. **It contains personal account/activity data. Do not upload this database to a public GitHub repository or share this ZIP publicly.** The `.gitignore` excludes it from Git. Back it up before first launch.

Phase 4 adds these tables without deleting existing tables: `diet_plans`, `user_diet_plans`, `subscriptions`, `user_subscriptions`, `nutritionists`, `consultations`, `doctors`, and `appointments`. The existing `users`, `meals`, and `notifications` tables are reused. SQLAlchemy `create_all` creates missing tables; it does not perform migrations for changed columns.

## VS Code setup (Windows PowerShell)

1. Extract the ZIP. In VS Code select **File → Open Folder** and choose the `FitTrack` folder.
2. Open a terminal (**Terminal → New Terminal**).
3. Configure backend environment:

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env`. Replace `SECRET_KEY` with a long random private value. Keep `DATABASE_URL=sqlite:///./fittrack.db` when running from the `backend` folder. Never commit `.env`.

4. Create Python environment and install packages:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If activation is blocked:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

5. Start the backend (keep this terminal running):

```powershell
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for Swagger.

6. Open a second VS Code terminal and start the frontend:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local Vite URL printed in the terminal (normally `http://localhost:5173`).

If PowerShell starts at the FitTrack root, use `cd backend` and `cd ..\frontend` as shown. Run the backend command only while the terminal's current folder is `backend`.

## Phase 4 modules

| Module | Feature | Included |
|---|---|---|
| 1 | Authentication | Reuses existing registration, login, JWT and protected routes |
| 2 | Diet plans | List, detail, assign plan, current user plan |
| 3 | Meal & nutrition tracking | Add/list meal entries, daily calories and macros; uses existing `meals` table |
| 4 | Subscriptions | Free/Premium/Pro plans, activate demo subscription, current plan |
| 5 | Nutritionist consultation | Profiles, Premium/Pro-gated booking, consultation history |
| 6 | Diet recommendations | Basic rule-based match by goal, calorie target and activity level |
| 7 | Notifications & reminders | Reuses notifications and Module 19 reminders; checks subscription/appointment/consultation alerts |
| 8 | Doctor support | Doctor directory/detail, appointment request and history |

A **Diet Platform** link is added to the existing navigation. Open it after login to use all Phase 4 sections.

## Backend testing — Swagger

1. Open `http://127.0.0.1:8000/docs`.
2. Use the existing `/api/auth/login` endpoint to log in. Copy `access_token`.
3. Click **Authorize** and enter `Bearer YOUR_ACCESS_TOKEN` if the Swagger dialog requests the full value; otherwise enter the token only in the OAuth2 form.
4. Test the endpoints below. All Phase 4 endpoints require the existing JWT bearer token.

| Module | Method | Endpoint | Expected |
|---|---|---|---|
| 2 | GET | `/api/diet-plans` | Seeded diet plan list |
| 2 | GET | `/api/diet-plans/1` | Diet plan detail |
| 2 | POST | `/api/diet-plans/assign` | Assign plan to logged-in user |
| 2 | GET | `/api/diet-plans/my/current` | Current assigned plan |
| 3 | POST | `/api/nutrition/meals` | Save meal for logged-in user |
| 3 | GET | `/api/nutrition/meals` | Only your meal entries |
| 3 | GET | `/api/nutrition/summary` | Today's calorie/macronutrient totals |
| 4 | GET | `/api/subscriptions` | Free/Premium/Pro list |
| 4 | POST | `/api/subscriptions/subscribe/2` | Activate demo Premium plan |
| 4 | GET | `/api/subscriptions/current` | Your active subscription |
| 5 | GET | `/api/nutritionists` | Nutritionist profiles |
| 5 | POST | `/api/consultations` | Request a consultation (Premium/Pro) |
| 5 | GET | `/api/consultations` | Your consultation history |
| 6 | POST | `/api/diet-recommendations` | Personalized rule-based suggestions |
| 7 | POST | `/api/health-alerts/generate` | Create due expiry/appointment alerts |
| 8 | GET | `/api/doctors` | Doctor directory |
| 8 | GET | `/api/doctors/1` | Doctor details |
| 8 | POST | `/api/appointments` | Request doctor appointment |
| 8 | GET | `/api/appointments` | Your appointment history |

### Sample request bodies

**Add a meal**

```json
{
  "meal_type": "Breakfast",
  "food_name": "Oats and banana",
  "calories": 350,
  "protein": 12,
  "carbs": 55,
  "fats": 8
}
```

**Assign a diet plan**

```json
{ "diet_plan_id": 1 }
```

**Book a nutritionist consultation** (activate Premium/Pro demo subscription first; choose a future timestamp)

```json
{
  "nutritionist_id": 1,
  "scheduled_time": "2026-12-01T10:30:00"
}
```

**Get diet recommendations**

```json
{
  "goal_type": "Weight Loss",
  "daily_calories": 1800,
  "activity_level": "Moderate"
}
```

**Book a doctor appointment**

```json
{
  "doctor_id": 1,
  "appointment_date": "2026-12-02",
  "time_slot": "10:00 AM"
}
```

## Frontend testing

1. Register/login using your existing account, if it exists in the retained database.
2. Click **Diet Platform** in the top navigation.
3. **Diet Plans:** view seeded plans, choose one, and confirm the active plan is displayed.
4. **Nutrition Tracking:** add a meal; verify today's calories/protein/carbs/fats and meal history update.
5. **Subscriptions:** view plans and activate Free/Premium/Pro demo access. Verify the current plan.
6. **Nutritionists:** view sample profiles. Premium/Pro can submit a future consultation request; Free should receive HTTP 403.
7. **Recommendations:** select goal, calorie target and activity level; confirm suggestions appear.
8. **Notifications:** view notifications and click “Check upcoming reminders & expiry alerts”; refresh and confirm alerts.
9. **Doctors:** view profiles, request a future appointment, and verify history.

## Important limitations / safety

- The Premium/Pro subscription button is a **demo entitlement only**. No payment gateway is connected and no money is collected. Do not present it as a real paid subscription.
- Seeded nutritionists and doctors are clearly labelled demo profiles with `.example.test` contact addresses. Replace them with verified licensed professionals and real availability before any public use.
- Consultation/appointment requests are stored as `PENDING`; this starter app does not send email/SMS or guarantee a booking.
- Diet suggestions are simple matching logic, not AI diagnosis, clinical nutrition advice, or a medical prescription. Calorie needs vary by person; use a qualified clinician for individualized recommendations.
- Meal reminders are supported through the existing Reminders page/API. Subscription/consultation/appointment alerts are generated when the user presses the check button or calls the endpoint; no background scheduler/push notification is configured.
- User data endpoints filter by the authenticated user. Keep JWT secrets private and do not publish your local SQLite database.

## Troubleshooting

**`ModuleNotFoundError` in backend:** activate `.venv`, then run `pip install -r requirements.txt` from `backend`.

**Frontend cannot connect:** ensure Uvicorn is running on port 8000 and `frontend/.env` contains `VITE_API_URL=http://127.0.0.1:8000/api`; restart Vite after editing it.

**401 Unauthorized:** log in again and ensure the browser has `fittrack_token`.

**403 when booking nutritionist:** activate the demo Premium or Pro subscription first.

**Port already in use:** stop the old server with `Ctrl+C`, or use another port and update the frontend API URL.

**Database changes:** always back up `backend/fittrack.db` before development. Do not delete it if you want to retain your existing records.
