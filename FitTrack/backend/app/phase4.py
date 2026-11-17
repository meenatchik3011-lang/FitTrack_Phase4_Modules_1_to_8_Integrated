
from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import get_db
from . import models
from .security import get_current_user


router = APIRouter(
    prefix="/api",
    tags=["Phase 4 - Nutrition & Diet"]
)


# =========================
# REQUEST SCHEMAS
# =========================

class AssignPlanIn(BaseModel):
    diet_plan_id: int


class MealIn(BaseModel):
    meal_type: Literal[
        "Breakfast", "Lunch", "Dinner", "Snacks"
    ]
    food_name: str = Field(min_length=2, max_length=120)
    calories: int = Field(ge=0, le=10000)
    protein: float = Field(ge=0, le=500)
    carbs: float = Field(ge=0, le=1000)
    fats: float = Field(ge=0, le=500)


class ConsultationIn(BaseModel):
    nutritionist_id: int
    scheduled_time: datetime


class AppointmentIn(BaseModel):
    doctor_id: int
    appointment_date: date
    time_slot: str = Field(min_length=2, max_length=40)


class RecommendationIn(BaseModel):
    goal_type: Literal[
        "Weight Loss", "Muscle Gain", "Maintenance"
    ]
    daily_calories: int = Field(ge=800, le=10000)
    activity_level: Literal["Low", "Moderate", "High"]


# =========================
# HELPER
# =========================

def owned_or_404(query, user_id):
    item = query.filter_by(user_id=user_id).first()

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )

    return item


# =========================
# SEED DATA
# =========================

def seed_phase4(db: Session):

    diet = [
        (
            "Balanced Weight Management",
            "Balanced meals with portion awareness and varied whole foods.",
            "Weight Loss",
            1800,
            30
        ),
        (
            "Strength & Muscle Support",
            "Protein-aware meal structure to support strength training.",
            "Muscle Gain",
            2400,
            30
        ),
        (
            "Healthy Maintenance",
            "A balanced routine designed around consistent meals.",
            "Maintenance",
            2000,
            30
        )
    ]

    for title, desc, goal, calories, days in diet:
        if not db.query(models.DietPlan).filter_by(
            title=title
        ).first():

            db.add(
                models.DietPlan(
                    title=title,
                    description=desc,
                    goal_type=goal,
                    daily_calories=calories,
                    duration=days
                )
            )

    subs = [
        (
            "Free",
            0,
            30,
            "Meal logging; basic nutrition summary"
        ),
        (
            "Premium",
            299,
            30,
            "All Free features; personalized diet suggestions; nutritionist booking"
        ),
        (
            "Pro",
            599,
            30,
            "All Premium features; priority consultation requests"
        )
    ]

    for name, price, duration, features in subs:
        if not db.query(models.Subscription).filter_by(
            name=name
        ).first():

            db.add(
                models.Subscription(
                    name=name,
                    price=price,
                    duration=duration,
                    features=features
                )
            )

    experts = [
        (
            "Demo Nutritionist",
            "Sports Nutrition",
            5,
            "demo.nutritionist@example.test",
            "Sample profile for local development. Replace with verified professional details."
        ),
        (
            "Demo Dietician",
            "Weight Management",
            4,
            "demo.dietician@example.test",
            "Sample profile for local development. Replace with verified professional details."
        )
    ]

    for name, spec, exp, contact, bio in experts:
        if not db.query(models.Nutritionist).filter_by(
            name=name
        ).first():

            db.add(
                models.Nutritionist(
                    name=name,
                    specialization=spec,
                    experience=exp,
                    contact_info=contact,
                    bio=bio
                )
            )

    doctors = [
        (
            "Demo General Doctor",
            "General Doctor",
            8,
            "demo.doctor@example.test"
        ),
        (
            "Demo Nutrition Expert",
            "Nutrition Expert",
            6,
            "demo.expert@example.test"
        )
    ]

    for name, spec, exp, contact in doctors:
        if not db.query(models.Doctor).filter_by(
            name=name
        ).first():

            db.add(
                models.Doctor(
                    name=name,
                    specialization=spec,
                    experience=exp,
                    contact_info=contact,
                    availability_status="AVAILABLE"
                )
            )

    db.commit()


# =========================
# MODULE 2 - DIET PLANS
# =========================

@router.get("/diet-plans")
def diet_plans(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.DietPlan).order_by(
        models.DietPlan.id
    ).all()


@router.get("/diet-plans/{plan_id}")
def diet_plan_detail(
    plan_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.get(models.DietPlan, plan_id)

    if not item:
        raise HTTPException(404, "Diet plan not found")

    return item


@router.post("/diet-plans/assign", status_code=201)
def assign_diet_plan(
    data: AssignPlanIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    plan = db.get(models.DietPlan, data.diet_plan_id)

    if not plan:
        raise HTTPException(404, "Diet plan not found")

    active = db.query(models.UserDietPlan).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).all()

    for old in active:
        old.status = "REPLACED"

    item = models.UserDietPlan(
        user_id=user.id,
        diet_plan_id=plan.id
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Diet plan assigned",
        "assignment_id": item.id,
        "plan": plan
    }


@router.get("/diet-plans/my/current")
def my_diet_plan(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.UserDietPlan).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).order_by(
        models.UserDietPlan.assigned_at.desc()
    ).first()

    if not item:
        return {
            "assignment": None,
            "plan": None
        }

    return {
        "assignment": item,
        "plan": item.plan
    }


# =========================
# MODULE 3 - MEAL TRACKING
# =========================

@router.post("/nutrition/meals", status_code=201)
def add_nutrition_meal(
    data: MealIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = models.Meal(
        user_id=user.id,
        **data.model_dump()
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get("/nutrition/meals")
def list_nutrition_meals(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Meal).filter_by(
        user_id=user.id
    ).order_by(
        models.Meal.created_at.desc()
    ).all()


# EDIT EXISTING MEAL
@router.put("/nutrition/meals/{meal_id}")
def update_nutrition_meal(
    meal_id: int,
    data: MealIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.Meal).filter_by(
        id=meal_id,
        user_id=user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    for field, value in data.model_dump().items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return {
        "message": "Meal updated successfully",
        "meal": item
    }


# DELETE EXISTING MEAL
@router.delete("/nutrition/meals/{meal_id}")
def delete_nutrition_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.Meal).filter_by(
        id=meal_id,
        user_id=user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Meal deleted successfully"
    }


# DAILY NUTRITION SUMMARY
@router.get("/nutrition/summary")
def nutrition_summary(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    today = date.today()

    totals = db.query(
        func.coalesce(func.sum(models.Meal.calories), 0),
        func.coalesce(func.sum(models.Meal.protein), 0),
        func.coalesce(func.sum(models.Meal.carbs), 0),
        func.coalesce(func.sum(models.Meal.fats), 0)
    ).filter(
        models.Meal.user_id == user.id,
        func.date(models.Meal.created_at) == today.isoformat()
    ).first()

    return {
        "calories": totals[0],
        "protein": totals[1],
        "carbs": totals[2],
        "fats": totals[3]
    }


# =========================
# MODULE 4 - SUBSCRIPTIONS
# =========================

@router.get("/subscriptions")
def subscription_plans(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Subscription).order_by(
        models.Subscription.price
    ).all()


@router.get("/subscriptions/current")
def current_subscription(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.UserSubscription).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).order_by(
        models.UserSubscription.start_date.desc()
    ).first()

    if not item:
        return {"subscription": None}

    if item.end_date < date.today():
        item.status = "EXPIRED"
        db.commit()
        return {"subscription": None}

    return {
        "subscription": {
            "id": item.id,
            "user_id": item.user_id,
            "subscription_id": item.subscription_id,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "status": item.status
        },
        "plan": {
            "id": item.plan.id,
            "name": item.plan.name,
            "price": item.plan.price,
            "duration": item.plan.duration,
            "features": item.plan.features
        }
    }


@router.post("/subscriptions/subscribe/{subscription_id}", status_code=201)
def subscribe(
    subscription_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    plan = db.get(models.Subscription, subscription_id)

    if not plan:
        raise HTTPException(
            404,
            "Subscription plan not found"
        )

    old_items = db.query(models.UserSubscription).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).all()

    for old in old_items:
        old.status = "REPLACED"

    item = models.UserSubscription(
        user_id=user.id,
        subscription_id=plan.id,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=plan.duration)
    )

    db.add(item)

    db.add(
        models.Notification(
            user_id=user.id,
            title="Subscription activated",
            message=(
                f"Your {plan.name} demo subscription is active "
                f"until {item.end_date}. No payment was processed."
            )
        )
    )

    db.commit()
    db.refresh(item)

    return {
        "message": "Demo subscription activated (payment not processed).",
        "subscription": {
            "id": item.id,
            "user_id": item.user_id,
            "subscription_id": item.subscription_id,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "status": item.status
        },
        "plan": {
            "id": plan.id,
            "name": plan.name,
            "price": plan.price,
            "duration": plan.duration,
            "features": plan.features
        }
    }


# =========================
# MODULE 5 - NUTRITIONISTS
# =========================

@router.get("/nutritionists")
def nutritionists(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Nutritionist).order_by(
        models.Nutritionist.name
    ).all()


@router.post("/consultations", status_code=201)
def book_consultation(
    data: ConsultationIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    expert = db.get(
        models.Nutritionist,
        data.nutritionist_id
    )

    if not expert:
        raise HTTPException(
            404,
            "Nutritionist not found"
        )

    scheduled_time = data.scheduled_time

    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(tzinfo=timezone.utc)
    else:
        scheduled_time = scheduled_time.astimezone(timezone.utc)

    if scheduled_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Choose a future consultation time"
        )

    sub = db.query(models.UserSubscription).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).order_by(
        models.UserSubscription.end_date.desc()
    ).first()

    if not sub or sub.plan.name not in ("Premium", "Pro"):
        raise HTTPException(
            403,
            "Premium or Pro subscription is required for nutritionist consultation"
        )

    item = models.Consultation(
        user_id=user.id,
        nutritionist_id=expert.id,
        scheduled_time=scheduled_time
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get("/consultations")
def consultation_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    records = (
        db.query(
            models.Consultation,
            models.Nutritionist.name.label("nutritionist_name")
        )
        .join(
            models.Nutritionist,
            models.Consultation.nutritionist_id == models.Nutritionist.id
        )
        .filter(
            models.Consultation.user_id == user.id
        )
        .order_by(
            models.Consultation.scheduled_time.desc()
        )
        .all()
    )

    return [
        {
            "id": consultation.id,
            "user_id": consultation.user_id,
            "nutritionist_id": consultation.nutritionist_id,
            "nutritionist_name": nutritionist_name,
            "scheduled_time": consultation.scheduled_time,
            "status": consultation.status,
            "created_at": consultation.created_at
        }
        for consultation, nutritionist_name in records
    ]


# =========================
# MODULE 8 - DOCTORS
# =========================

@router.get("/doctors")
def doctors(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Doctor).order_by(
        models.Doctor.name
    ).all()


@router.get("/doctors/{doctor_id}")
def doctor_detail(
    doctor_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.get(models.Doctor, doctor_id)

    if not item:
        raise HTTPException(
            404,
            "Doctor not found"
        )

    return item


@router.post("/appointments", status_code=201)
def book_appointment(
    data: AppointmentIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    doctor = db.get(
        models.Doctor,
        data.doctor_id
    )

    if not doctor:
        raise HTTPException(
            404,
            "Doctor not found"
        )

    if doctor.availability_status != "AVAILABLE":
        raise HTTPException(
            409,
            "Doctor is not currently available"
        )

    if data.appointment_date < date.today():
        raise HTTPException(
            400,
            "Appointment date cannot be in the past"
        )

    item = models.Appointment(
        user_id=user.id,
        doctor_id=doctor.id,
        appointment_date=data.appointment_date,
        time_slot=data.time_slot
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get("/appointments")
def appointment_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    records = (
        db.query(
            models.Appointment,
            models.Doctor.name.label("doctor_name")
        )
        .join(models.Doctor, models.Appointment.doctor_id == models.Doctor.id)
        .filter(models.Appointment.user_id == user.id)
        .order_by(
            models.Appointment.appointment_date.desc(),
            models.Appointment.id.desc()
        )
        .all()
    )

    return [
        {
            "id": item.id,
            "user_id": item.user_id,
            "doctor_id": item.doctor_id,
            "doctor_name": doctor_name,
            "appointment_date": item.appointment_date,
            "time_slot": item.time_slot,
            "status": item.status,
            "created_at": item.created_at
        }
        for item, doctor_name in records
    ]


@router.put("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: int,
    data: AppointmentIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.Appointment).filter_by(
        id=appointment_id,
        user_id=user.id
    ).first()

    if not item:
        raise HTTPException(404, "Appointment not found")

    if item.status != "PENDING":
        raise HTTPException(409, "Only pending appointments can be edited")

    doctor = db.get(models.Doctor, data.doctor_id)
    if not doctor:
        raise HTTPException(404, "Doctor not found")

    if doctor.availability_status != "AVAILABLE":
        raise HTTPException(409, "Doctor is not currently available")

    if data.appointment_date < date.today():
        raise HTTPException(400, "Appointment date cannot be in the past")

    item.doctor_id = doctor.id
    item.appointment_date = data.appointment_date
    item.time_slot = data.time_slot
    db.commit()
    db.refresh(item)

    return {"message": "Appointment updated successfully", "appointment": item}


@router.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.Appointment).filter_by(
        id=appointment_id,
        user_id=user.id
    ).first()

    if not item:
        raise HTTPException(404, "Appointment not found")

    if item.status != "PENDING":
        raise HTTPException(409, "Only pending appointments can be cancelled")

    item.status = "CANCELLED"
    db.commit()
    db.refresh(item)

    return {"message": "Appointment cancelled successfully", "appointment": item}


@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(models.Appointment).filter_by(
        id=appointment_id,
        user_id=user.id
    ).first()

    if not item:
        raise HTTPException(404, "Appointment not found")

    db.delete(item)
    db.commit()

    return {"message": "Appointment deleted permanently"}


# =========================
# MODULE 6 - RECOMMENDATIONS
# =========================

@router.post("/diet-recommendations")
def diet_recommendations(
    data: RecommendationIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    plans = db.query(models.DietPlan).filter_by(
        goal_type=data.goal_type
    ).all()

    if not plans:
        raise HTTPException(
            status_code=404,
            detail="No diet recommendations found for this goal"
        )

    # Rank plans by how close their preset calorie target is
    # to the calorie target entered by the user.
    ranked = sorted(
        plans,
        key=lambda p: abs(
            p.daily_calories - data.daily_calories
        )
    )

    activity_note = {
        "Low": "Start with gentle, sustainable activity.",
        "Moderate": "Pair balanced meals with regular activity.",
        "High": "Consider recovery and adequate fueling."
    }[data.activity_level]

    # Return plain dictionaries and use the user's entered calorie
    # target in the recommendation card, rather than the plan's
    # predefined seed calorie value.
    recommendation_items = [
        {
            "id": plan.id,
            "title": plan.title,
            "description": plan.description,
            "goal_type": plan.goal_type,
            "daily_calories": data.daily_calories,
            "plan_reference_calories": plan.daily_calories,
            "duration": plan.duration
        }
        for plan in ranked[:3]
    ]

    return {
        "goal_type": data.goal_type,
        "daily_calories": data.daily_calories,
        "activity_level": data.activity_level,
        "activity_note": activity_note,
        "recommendations": recommendation_items,
        "disclaimer": (
            "Basic rule-based suggestions only; not medical advice. "
            "A qualified professional should personalize nutrition "
            "for medical conditions."
        )
    }


# =========================
# MODULE 7 - HEALTH ALERTS
# =========================

@router.post("/health-alerts/generate")
def generate_health_alerts(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    created = []
    today = date.today()

    def add_once(title, message):
        exists = db.query(models.Notification).filter_by(
            user_id=user.id,
            title=title,
            message=message
        ).first()

        if not exists:
            db.add(
                models.Notification(
                    user_id=user.id,
                    title=title,
                    message=message
                )
            )
            created.append(title)

    subscriptions = db.query(
        models.UserSubscription
    ).filter_by(
        user_id=user.id,
        status="ACTIVE"
    ).all()

    for item in subscriptions:
        days_left = (item.end_date - today).days

        if 0 <= days_left <= 3:
            add_once(
                "Subscription expiry reminder",
                f"Your {item.plan.name} subscription expires in "
                f"{days_left} day(s), on {item.end_date}."
            )

        elif days_left < 0:
            item.status = "EXPIRED"

            add_once(
                "Subscription expired",
                f"Your {item.plan.name} subscription expired "
                f"on {item.end_date}."
            )

    for item in db.query(models.Consultation).filter_by(
        user_id=user.id,
        status="PENDING"
    ).all():

        if 0 <= (
            item.scheduled_time.date() - today
        ).days <= 1:

            add_once(
                "Consultation reminder",
                f"Your nutritionist consultation is scheduled "
                f"for {item.scheduled_time}."
            )

    for item in db.query(models.Appointment).filter_by(
        user_id=user.id,
        status="PENDING"
    ).all():

        if 0 <= (
            item.appointment_date - today
        ).days <= 1:

            add_once(
                "Doctor appointment reminder",
                f"Your doctor appointment is scheduled for "
                f"{item.appointment_date} at {item.time_slot}."
            )

    db.commit()

    return {
        "created_count": len(created),
        "alerts": created,
        "note": (
            "Meal reminders can be created in the existing "
            "Reminders module using reminder_type Meal."
        )
    }
