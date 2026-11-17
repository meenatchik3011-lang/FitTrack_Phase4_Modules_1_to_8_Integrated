
import React, { useEffect, useState } from 'react';
import api from './api';

const tabs = [
  'Diet Plans',
  'Nutrition Tracking',
  'Subscriptions',
  'Nutritionists',
  'Recommendations',
  'Notifications',
  'Doctors'
];

const emptyMeal = {
  meal_type: 'Breakfast',
  food_name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0
};

function Error({ text }) {
  return text ? <p className="error">{text}</p> : null;
}

function Panel({ title, children }) {
  return (
    <article className="phase4-panel">
      <h2>{title}</h2>
      {children}
    </article>
  );
}

export default function Phase4() {
  const [tab, setTab] = useState(tabs[0]);

  const [plans, setPlans] = useState([]);
  const [myDiet, setMyDiet] = useState(null);
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState({});

  const [subs, setSubs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [nutritionists, setNutritionists] = useState([]);

  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [recommendations, setRecommendations] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Meal editing state
  const [meal, setMeal] = useState(emptyMeal);
  const [editingId, setEditingId] = useState(null);
  const [savingMeal, setSavingMeal] = useState(false);

  const [goal, setGoal] = useState({
    goal_type: 'Weight Loss',
    daily_calories: 1800,
    activity_level: 'Moderate'
  });

  const [consult, setConsult] = useState({
    nutritionist_id: '',
    scheduled_time: ''
  });

  const [appointment, setAppointment] = useState({
    doctor_id: '',
    appointment_date: '',
    time_slot: '10:00 AM'
  });
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  // Load all module data
  async function loadAll() {
    try {
      const [
        p, m, s, n, c, d, a, no, sp, cs, dp
      ] = await Promise.all([
        api.get('/diet-plans'),
        api.get('/nutrition/meals'),
        api.get('/nutrition/summary'),
        api.get('/nutritionists'),
        api.get('/consultations'),
        api.get('/doctors'),
        api.get('/appointments'),
        api.get('/notifications'),
        api.get('/subscriptions'),
        api.get('/subscriptions/current'),
        api.get('/diet-plans/my/current')
      ]);

      setPlans(p.data);
      setMeals(m.data);
      setSummary(s.data);
      setMyDiet(dp.data.plan || null);
      setNutritionists(n.data);
      setConsultations(c.data);
      setDoctors(d.data);
      setAppointments(a.data);
      setNotifications(no.data);
      setSubs(sp.data);
      setCurrent(cs.data);

      setError('');
    } catch (e) {
      setError(
        e.response?.data?.detail ||
        'Could not load data. Check backend and login.'
      );
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Common API action handler
  async function run(action, successText) {
    try {
      setError('');
      setMessage('');

      await action();

      setMessage(successText);
      await loadAll();
      return true;
    } catch (e) {
      setError(
        e.response?.data?.detail || 'Request failed'
      );
      return false;
    }
  }

  // Add or update a meal
  async function saveMeal(e) {
    e.preventDefault();

    setSavingMeal(true);
    setError('');
    setMessage('');

    const payload = {
      ...meal,
      calories: Number(meal.calories),
      protein: Number(meal.protein),
      carbs: Number(meal.carbs),
      fats: Number(meal.fats)
    };

    try {
      if (editingId !== null) {
        // Update existing meal
        await api.put(
          `/nutrition/meals/${editingId}`,
          payload
        );

        setMessage('Meal updated successfully.');
      } else {
        // Add new meal
        await api.post('/nutrition/meals', payload);

        setMessage('Meal saved successfully.');
      }

      setMeal({ ...emptyMeal });
      setEditingId(null);

      await loadAll();
    } catch (e) {
      setError(
        e.response?.data?.detail ||
        (editingId !== null
          ? 'Could not update meal.'
          : 'Could not save meal.')
      );
    } finally {
      setSavingMeal(false);
    }
  }

  // Load selected meal into the form
  function editMeal(item) {
    setEditingId(item.id);

    setMeal({
      meal_type: item.meal_type,
      food_name: item.food_name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    });

    setError('');
    setMessage('Editing meal #' + item.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Cancel editing
  function cancelMealEdit() {
    setEditingId(null);
    setMeal({ ...emptyMeal });
    setError('');
    setMessage('');
  }

  // Delete a meal
  async function deleteMeal(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this meal?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await api.delete(`/nutrition/meals/${id}`);

      if (editingId === id) {
        setEditingId(null);
        setMeal({ ...emptyMeal });
      }

      setMessage('Meal deleted successfully.');

      await loadAll();
    } catch (e) {
      setError(
        e.response?.data?.detail ||
        'Could not delete meal.'
      );
    }
  }

  // Generate diet recommendations
  async function recommend(e) {
    e.preventDefault();

    try {
      const r = await api.post('/diet-recommendations', {
        ...goal,
        daily_calories: Number(goal.daily_calories)
      });

      setRecommendations(r.data);
      setError('');
      setMessage('');
    } catch (e) {
      setError(
        e.response?.data?.detail ||
        'Recommendation failed'
      );
    }
  }

  // Book nutritionist consultation
  async function bookConsult(e) {
    e.preventDefault();

    await run(
      () => api.post('/consultations', {
        nutritionist_id: Number(consult.nutritionist_id),
        scheduled_time: new Date(
          consult.scheduled_time
        ).toISOString()
      }),
      'Consultation request submitted.'
    );
  }

  // Create a new appointment or save appointment edits
  async function bookDoctor(e) {
    e.preventDefault();

    const payload = {
      doctor_id: Number(appointment.doctor_id),
      appointment_date: appointment.appointment_date,
      time_slot: appointment.time_slot.trim()
    };

    const succeeded = await run(
      () => editingAppointmentId !== null
        ? api.put(`/appointments/${editingAppointmentId}`, payload)
        : api.post('/appointments', payload),
      editingAppointmentId !== null
        ? 'Appointment updated successfully.'
        : 'Appointment request submitted.'
    );

    if (succeeded) {
      setAppointment({ doctor_id: '', appointment_date: '', time_slot: '10:00 AM' });
      setEditingAppointmentId(null);
    }
  }

  // Load an appointment into the form for editing
  function editAppointment(item) {
    if (item.status !== 'PENDING') return;

    setEditingAppointmentId(item.id);
    setAppointment({
      doctor_id: String(item.doctor_id),
      appointment_date: String(item.appointment_date).slice(0, 10),
      time_slot: item.time_slot
    });
    setError('');
    setMessage(`Editing appointment #${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelAppointmentEdit() {
    setEditingAppointmentId(null);
    setAppointment({ doctor_id: '', appointment_date: '', time_slot: '10:00 AM' });
    setError('');
    setMessage('Appointment editing cancelled.');
  }

  async function cancelAppointment(id) {
    if (!window.confirm(`Cancel appointment #${id}?`)) return;
    const succeeded = await run(
      () => api.patch(`/appointments/${id}/cancel`),
      `Appointment #${id} cancelled.`
    );
    if (succeeded && editingAppointmentId === id) cancelAppointmentEdit();
  }

  async function deleteAppointment(id) {
    if (!window.confirm(`Permanently delete appointment #${id}? This cannot be undone.`)) return;
    const succeeded = await run(
      () => api.delete(`/appointments/${id}`),
      `Appointment #${id} deleted permanently.`
    );
    if (succeeded && editingAppointmentId === id) cancelAppointmentEdit();
  }

  return (
    <div className="phase4">

      <h1>Nutrition & Diet Management</h1>

      <p>
        Manage diet plans, nutrition, subscriptions
        and professional support.
      </p>

      {/* Navigation */}
      <div className="phase4-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={tab === t ? '' : 'secondary'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <Error text={error} />

      {message && (
        <p className="success">{message}</p>
      )}

      {/* MODULE 2 - DIET PLANS */}
      {tab === 'Diet Plans' && (
        <>
          <Panel title="Available diet plans">

            <div className="cards">
              {plans.map(p => (
                <article key={p.id}>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>

                  <p>
                    <b>{p.goal_type}</b>
                    {' · '}
                    {p.daily_calories} kcal/day
                    {' · '}
                    {p.duration} days
                  </p>

                  <button
                    onClick={() =>
                      run(
                        () => api.post(
                          '/diet-plans/assign',
                          { diet_plan_id: p.id }
                        ),
                        'Diet plan assigned.'
                      )
                    }
                  >
                    Choose this plan
                  </button>
                </article>
              ))}
            </div>

          </Panel>

          <Panel title="My active diet plan">

            <button
              className="secondary"
              onClick={() =>
                run(
                  () => api.get('/diet-plans/my/current'),
                  'Current plan refreshed.'
                )
              }
            >
              Refresh current plan
            </button>

            <p>
              {myDiet
                ? `${myDiet.title} · ${myDiet.daily_calories} kcal/day · ${myDiet.duration} days`
                : 'No active diet plan assigned yet.'}
            </p>

          </Panel>
        </>
      )}

      {/* MODULE 3 - NUTRITION TRACKING */}
      {tab === 'Nutrition Tracking' && (
        <>
          <section className="cards">

            {[
              ['Calories', summary.calories || 0],
              ['Protein (g)', summary.protein || 0],
              ['Carbs (g)', summary.carbs || 0],
              ['Fats (g)', summary.fats || 0]
            ].map(x => (
              <article key={x[0]}>
                <small>{x[0]} today</small>
                <h2>{x[1]}</h2>
              </article>
            ))}

          </section>

          <Panel
            title={
              editingId !== null
                ? 'Edit meal'
                : 'Add meal'
            }
          >

            <form
              className="formgrid"
              onSubmit={saveMeal}
            >

              <select
                value={meal.meal_type}
                onChange={e =>
                  setMeal({
                    ...meal,
                    meal_type: e.target.value
                  })
                }
              >
                {[
                  'Breakfast',
                  'Lunch',
                  'Dinner',
                  'Snacks'
                ].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Food name"
                value={meal.food_name}
                onChange={e =>
                  setMeal({
                    ...meal,
                    food_name: e.target.value
                  })
                }
                minLength={2}
                maxLength={120}
                required
              />

              <input
                type="number"
                min="0"
                max="10000"
                placeholder="Calories"
                value={meal.calories}
                onChange={e =>
                  setMeal({
                    ...meal,
                    calories: e.target.value
                  })
                }
                required
              />

              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                placeholder="Protein (g)"
                value={meal.protein}
                onChange={e =>
                  setMeal({
                    ...meal,
                    protein: e.target.value
                  })
                }
              />

              <input
                type="number"
                min="0"
                max="1000"
                step="0.1"
                placeholder="Carbs (g)"
                value={meal.carbs}
                onChange={e =>
                  setMeal({
                    ...meal,
                    carbs: e.target.value
                  })
                }
              />

              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                placeholder="Fats (g)"
                value={meal.fats}
                onChange={e =>
                  setMeal({
                    ...meal,
                    fats: e.target.value
                  })
                }
              />

              <button
                type="submit"
                disabled={savingMeal}
              >
                {savingMeal
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Meal'
                    : 'Add meal'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={cancelMealEdit}
                >
                  Cancel
                </button>
              )}

            </form>

          </Panel>

          <Panel title="Meal history">

            {meals.length === 0 && (
              <p>No meals recorded yet.</p>
            )}

            {meals.map(item => (
              <article
                key={item.id}
                className="notification"
              >
                <p>
                  <b>{item.meal_type}:</b>
                  {' '}
                  {item.food_name}
                  {' — '}
                  {item.calories} kcal,
                  {' P '}{item.protein}g
                  {' / C '}{item.carbs}g
                  {' / F '}{item.fats}g
                </p>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => editMeal(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() => deleteMeal(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}

          </Panel>
        </>
      )}

      {/* MODULE 4 - SUBSCRIPTIONS */}
      {tab === 'Subscriptions' && (
        <>
          <Panel title="Current subscription">
            <p>
              {current?.plan
                ? `${current.plan.name} · valid until ${current.subscription.end_date}`
                : 'No active subscription (Free access).'}
            </p>
          </Panel>

          <Panel title="Choose a plan">
            <div className="cards">
              {subs.map(s => (
                <article key={s.id}>
                  <h3>{s.name}</h3>
                  <h2>₹{s.price}</h2>
                  <p>{s.duration} days</p>
                  <p>{s.features}</p>

                  <button
                    onClick={() =>
                      run(
                        () => api.post(
                          `/subscriptions/subscribe/${s.id}`
                        ),
                        `Demo ${s.name} plan activated. No payment is collected.`
                      )
                    }
                  >
                    {s.price === 0
                      ? 'Select Free'
                      : 'Activate demo plan'}
                  </button>
                </article>
              ))}
            </div>

            <small>
              Demo only: subscription activation does
              not process real payments.
            </small>
          </Panel>
        </>
      )}

      {/* MODULE 5 - NUTRITIONISTS */}
      {tab === 'Nutritionists' && (
        <>
          <Panel title="Nutritionist profiles">
            <div className="cards">
              {nutritionists.map(n => (
                <article key={n.id}>
                  <h3>{n.name}</h3>
                  <p>{n.specialization}</p>
                  <p>{n.experience} years experience</p>
                  <p>{n.bio}</p>
                  <small>{n.contact_info}</small>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Book consultation (Premium / Pro)">
            <form className="formgrid" onSubmit={bookConsult}>

              <select
                required
                value={consult.nutritionist_id}
                onChange={e =>
                  setConsult({
                    ...consult,
                    nutritionist_id: e.target.value
                  })
                }
              >
                <option value="">Select nutritionist</option>
                {nutritionists.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                required
                value={consult.scheduled_time}
                onChange={e =>
                  setConsult({
                    ...consult,
                    scheduled_time: e.target.value
                  })
                }
              />

              <button>Request consultation</button>
            </form>

            <h3>Consultation history</h3>

            {consultations.length === 0 && (
              <p>No consultations booked yet.</p>
            )}

            {consultations.map(c => (
              <article key={c.id} className="notification">
                <h3>Consultation #{c.id}</h3>

                <p>
                  <strong>Nutritionist:</strong>{' '}
                  {c.nutritionist_name || 'Not available'}
                </p>

                <p>
                  <strong>Date & Time:</strong>{' '}
                  {new Date(c.scheduled_time).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong> {c.status}
                </p>
              </article>
            ))}
          </Panel>
        </>
      )}

      {/* MODULE 6 - RECOMMENDATIONS */}
      {tab === 'Recommendations' && (
        <Panel title="Personalized diet suggestions">

          <form className="formgrid" onSubmit={recommend}>

            <select
              value={goal.goal_type}
              onChange={e =>
                setGoal({
                  ...goal,
                  goal_type: e.target.value
                })
              }
            >
              {[
                'Weight Loss',
                'Muscle Gain',
                'Maintenance'
              ].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>

            <input
              type="number"
              min="800"
              max="10000"
              value={goal.daily_calories}
              onChange={e =>
                setGoal({
                  ...goal,
                  daily_calories: e.target.value
                })
              }
            />

            <select
              value={goal.activity_level}
              onChange={e =>
                setGoal({
                  ...goal,
                  activity_level: e.target.value
                })
              }
            >
              {['Low', 'Moderate', 'High'].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>

            <button>Get recommendations</button>
          </form>

          {recommendations && (
            <>
              <p>{recommendations.activity_note}</p>

              {recommendations.recommendations.map(p => (
                <article key={p.id}>
                  <h3>{p.title}</h3>
                  <p>
                    {p.daily_calories} kcal/day
                    {' · '}{p.duration} days
                  </p>
                  <p>{p.description}</p>
                </article>
              ))}

              <small>{recommendations.disclaimer}</small>
            </>
          )}

        </Panel>
      )}

      {/* MODULE 7 - NOTIFICATIONS */}
      {tab === 'Notifications' && (
        <Panel title="Your notifications">

          <button
            onClick={() =>
              run(
                () => api.post('/health-alerts/generate'),
                'Health alerts checked.'
              )
            }
          >
            Check upcoming reminders & expiry alerts
          </button>

          {notifications.map(n => (
            <article
              key={n.id}
              className="notification"
            >
              <b>{n.title}</b>
              <p>{n.message}</p>
              <small>
                {new Date(n.created_at).toLocaleString()}
                {' · '}
                {n.is_read ? 'Read' : 'Unread'}
              </small>
            </article>
          ))}

        </Panel>
      )}

      {/* MODULE 8 - DOCTORS */}
      {tab === 'Doctors' && (
        <>
          <Panel title="Doctor directory">
            <div className="cards">
              {doctors.map(d => (
                <article key={d.id}>
                  <h3>{d.name}</h3>
                  <p>{d.specialization}</p>
                  <p>{d.experience} years experience</p>
                  <p>Status: {d.availability_status}</p>
                  <small>{d.contact_info}</small>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title={editingAppointmentId !== null ? 'Edit doctor appointment' : 'Book doctor appointment'}>

            <form className="formgrid" onSubmit={bookDoctor}>

              <select
                required
                value={appointment.doctor_id}
                onChange={e =>
                  setAppointment({
                    ...appointment,
                    doctor_id: e.target.value
                  })
                }
              >
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>

              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                required
                value={appointment.appointment_date}
                onChange={e =>
                  setAppointment({
                    ...appointment,
                    appointment_date: e.target.value
                  })
                }
              />

              <input
                value={appointment.time_slot}
                onChange={e =>
                  setAppointment({
                    ...appointment,
                    time_slot: e.target.value
                  })
                }
                required
              />

              <button type="submit">
                {editingAppointmentId !== null ? 'Save changes' : 'Request appointment'}
              </button>
              {editingAppointmentId !== null && (
                <button type="button" className="secondary" onClick={cancelAppointmentEdit}>
                  Stop editing
                </button>
              )}
            </form>

            <h3>Appointment history</h3>
            {appointments.length === 0 && <p>No appointments booked yet.</p>}
            {appointments.map(a => (
              <article key={a.id} className="notification">
                <h3>Appointment #{a.id}</h3>
                <p><strong>Doctor:</strong> {a.doctor_name || `Doctor ID ${a.doctor_id}`}</p>
                <p><strong>Date:</strong> {String(a.appointment_date).slice(0, 10)}</p>
                <p><strong>Time:</strong> {a.time_slot}</p>
                <p><strong>Status:</strong> {a.status}</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {a.status === 'PENDING' && (
                    <>
                      <button type="button" onClick={() => editAppointment(a)}>Edit</button>
                      <button type="button" className="secondary" onClick={() => cancelAppointment(a.id)}>Cancel appointment</button>
                    </>
                  )}
                  <button type="button" className="secondary" onClick={() => deleteAppointment(a.id)}>Delete</button>
                </div>
              </article>
            ))}
          </Panel>
        </>
      )}

    </div>
  );
}
