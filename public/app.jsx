/* public/app.jsx */
const { useState, useEffect } = React;

/* ---------- Supabase ---------- */
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase  = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const useSupabase =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY';

/* ---------- Local-storage helpers ---------- */
function loadTrips() {
  const data = localStorage.getItem('trips');
  return data ? JSON.parse(data) : [];
}

function saveTrips(trips) {
  localStorage.setItem('trips', JSON.stringify(trips));
}

/* ---------- Main App ---------- */
function App() {
  const [trips, setTrips] = useState(loadTrips());
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    cost: 135,
    description: '',
    min: 4,
    max: 9,
  });

  /* -- fetch Supabase data once on mount -- */
  useEffect(() => {
    if (!useSupabase) return;

    (async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, participants(*)')
        .order('date');

      if (!error) {
        setTrips(
          data.map((t) => ({
            ...t,
            participants: t.participants || [],
          })),
        );
      } else {
        console.error(error);
      }
    })();
  }, []);

  /* -- persist to localStorage for offline demo ---- */
  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  /* ---------- CRUD helpers ---------- */
  async function addTrip(e) {
    e.preventDefault();
    let newTrip = { ...form, participants: [] };

    if (useSupabase) {
      const { data, error } = await supabase
        .from('trips')
        .insert([form])
        .select();
      if (error) return console.error(error);
      newTrip.id = data[0].id;
    } else {
      newTrip.id = Date.now();
    }

    setTrips([...trips, newTrip]);
    setForm({ ...form, title: '', date: '', location: '', description: '' });
  }

  async function deleteTrip(id) {
    if (useSupabase) {
      await supabase.from('participants').delete().eq('trip_id', id);
      await supabase.from('trips').delete().eq('id', id);
    }
    setTrips(trips.filter((t) => t.id !== id));
  }

  async function addParticipant(tripId, name) {
    let newP = { name, interest: 'interested', payment: 'unpaid' };

    if (useSupabase) {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ trip_id: tripId, ...newP }])
        .select();
      if (error) return console.error(error);
      newP.id = data[0].id;
    } else {
      newP.id = Date.now();
    }

    setTrips(
      trips.map((t) => {
        if (t.id === tripId) t.participants.push(newP);
        return t;
      }),
    );
  }

  async function toggleInterest(tripId, pid) {
    setTrips(
      trips.map((t) => {
        if (t.id === tripId) {
          t.participants = t.participants.map((p) => {
            if (p.id === pid)
              p.interest =
                p.interest === 'interested' ? 'confirmed' : 'interested';
            return p;
          });
        }
        return t;
      }),
    );

    if (useSupabase) {
      const participant = trips
        .find((t) => t.id === tripId)
        .participants.find((p) => p.id === pid);
      const newInterest =
        participant.interest === 'interested' ? 'confirmed' : 'interested';
      await supabase
        .from('participants')
        .update({ interest: newInterest })
        .eq('id', pid);
    }
  }

  async function togglePayment(tripId, pid) {
    setTrips(
      trips.map((t) => {
        if (t.id === tripId) {
          t.participants = t.participants.map((p) => {
            if (p.id === pid)
              p.payment = p.payment === 'unpaid' ? 'paid' : 'unpaid';
            return p;
          });
        }
        return t;
      }),
    );

    if (useSupabase) {
      const participant = trips
        .find((t) => t.id === tripId)
        .participants.find((p) => p.id === pid);
      const newPayment = participant.payment === 'unpaid' ? 'paid' : 'unpaid';
      await supabase
        .from('participants')
        .update({ payment: newPayment })
        .eq('id', pid);
    }
  }

  async function removeParticipant(tripId, pid) {
    if (useSupabase) {
      await supabase.from('participants').delete().eq('id', pid);
    }
    setTrips(
      trips.map((t) => {
        if (t.id === tripId)
          t.participants = t.participants.filter((p) => p.id !== pid);
        return t;
      }),
    );
  }

  /* ---------- helpers ---------- */
  function getStatus(trip) {
    const confirmed = trip.participants.filter(
      (p) => p.interest === 'confirmed',
    ).length;
    return confirmed >= trip.min ? 'Confirmed' : 'Pending';
  }

  function broadcastMessage(trip) {
    const text = `Dive Trip: ${trip.title}\nDate: ${trip.date}\nLocation: ${trip.location}\nCost: $${trip.cost}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  /* ---------- render ---------- */
  const today = new Date().toISOString().split('T')[0];
  const upcoming = trips.filter((t) => t.date >= today);
  const past     = trips.filter((t) => t.date <  today);

  /* -- omitted: ParticipantRow & TripCard components (unchanged) -- */
  /* paste your existing JSX for those below this line */

  /* ---------- ... existing ParticipantRow and TripCard code ... ---------- */

  return (
    /* your original JSX layout (unchanged) */
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);