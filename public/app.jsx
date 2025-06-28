const { useState, useEffect } = React;

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const useSupabase = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY';

function loadTrips() {
  const data = localStorage.getItem('trips');
  return data ? JSON.parse(data) : [];
}

function saveTrips(trips) {
  localStorage.setItem('trips', JSON.stringify(trips));
}

function App() {
  const [trips, setTrips] = useState(loadTrips());
  const [form, setForm] = useState({ title: '', date: '', location: '', cost: 135, description: '', min: 4, max: 9 });

  async function fetchTrips() {
    if (!useSupabase) return;
    const { data, error } = await supabase
      .from('trips')
      .select('*, participants(*)')
      .order('date');
    if (!error) {
      setTrips(data.map(t => ({ ...t, participants: t.participants || [] })));
    }
  }

  useEffect(() => {
    if (useSupabase) {
      fetchTrips();
    }
  }, []);

  useEffect(() => { saveTrips(trips); }, [trips]);

  async function addTrip(e) {
    e.preventDefault();
    let newTrip = { ...form, participants: [] };
    if (useSupabase) {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ title: form.title, date: form.date, location: form.location, cost: form.cost, description: form.description, min: form.min, max: form.max }])
        .select();
      if (error) return console.error(error);
      newTrip.id = data[0].id;
    } else {
      newTrip.id = Date.now();
    }
    setTrips([...trips, newTrip]);
    setForm({ title: '', date: '', location: '', cost: 135, description: '', min: 4, max: 9 });
  }

  async function deleteTrip(id) {
    if (useSupabase) {
      await supabase.from('participants').delete().eq('trip_id', id);
      await supabase.from('trips').delete().eq('id', id);
    }
    setTrips(trips.filter(t => t.id !== id));
  }

  async function addParticipant(tripId, name) {
    let newP = { name, interest: 'interested', payment: 'unpaid' };
    if (useSupabase) {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ trip_id: tripId, name, interest: 'interested', payment: 'unpaid' }])
        .select();
      if (error) return console.error(error);
      newP.id = data[0].id;
    } else {
      newP.id = Date.now();
    }
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        t.participants.push(newP);
      }
      return t;
    }));
  }

  async function toggleInterest(tripId, pid) {
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        t.participants = t.participants.map(p => {
          if (p.id === pid) {
            p.interest = p.interest === 'interested' ? 'confirmed' : 'interested';
          }
          return p;
        });
      }
      return t;
    }));
    if (useSupabase) {
      const participant = trips.find(t => t.id === tripId).participants.find(p => p.id === pid);
      const newInterest = participant.interest === 'interested' ? 'confirmed' : 'interested';
      await supabase.from('participants').update({ interest: newInterest }).eq('id', pid);
    }
  }

  async function togglePayment(tripId, pid) {
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        t.participants = t.participants.map(p => {
          if (p.id === pid) {
            p.payment = p.payment === 'unpaid' ? 'paid' : 'unpaid';
          }
          return p;
        });
      }
      return t;
    }));
    if (useSupabase) {
      const participant = trips.find(t => t.id === tripId).participants.find(p => p.id === pid);
      const newPayment = participant.payment === 'unpaid' ? 'paid' : 'unpaid';
      await supabase.from('participants').update({ payment: newPayment }).eq('id', pid);
    }
  }

  async function removeParticipant(tripId, pid) {
    if (useSupabase) {
      await supabase.from('participants').delete().eq('id', pid);
    }
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        t.participants = t.participants.filter(p => p.id !== pid);
      }
      return t;
    }));
  }

  function getStatus(trip) {
    const confirmed = trip.participants.filter(p => p.interest === 'confirmed').length;
    return confirmed >= trip.min ? 'Confirmed' : 'Pending';
  }

  function broadcastMessage(trip) {
    const text = `Dive Trip: ${trip.title}\nDate: ${trip.date}\nLocation: ${trip.location}\nCost: $${trip.cost}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = trips.filter(t => t.date >= today);
  const past = trips.filter(t => t.date < today);

  function ParticipantRow({tripId, p}) {
    return (
      <tr className={p.payment === 'paid' ? 'table-success' : ''}>
        <td>{p.name}</td>
        <td>
          <button className="btn btn-sm btn-outline-primary" onClick={() => toggleInterest(tripId, p.id)}>{p.interest}</button>
        </td>
        <td>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => togglePayment(tripId, p.id)}>{p.payment}</button>
        </td>
        <td>
          <button className="btn btn-sm btn-danger" onClick={() => removeParticipant(tripId, p.id)}>Remove</button>
        </td>
      </tr>
    );
  }

  function TripCard({trip}) {
    const [name, setName] = useState('');
    const sorted = [...trip.participants].sort((a,b) => {
      const interestOrder = a.interest === b.interest ? 0 : a.interest === 'confirmed' ? -1 : 1;
      if (interestOrder !== 0) return interestOrder;
      const payOrder = a.payment === b.payment ? 0 : a.payment === 'paid' ? -1 : 1;
      return payOrder;
    });

    return (
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">{trip.title} ({getStatus(trip)})</h5>
          <h6 className="card-subtitle mb-2 text-muted">{trip.date} - {trip.location}</h6>
          <p className="card-text">Cost: ${trip.cost}</p>
          <p className="card-text">{trip.description}</p>
          <button className="btn btn-success btn-sm me-2" onClick={() => broadcastMessage(trip)}>Broadcast Trip</button>
          <button className="btn btn-danger btn-sm" onClick={() => deleteTrip(trip.id)}>Delete Trip</button>
          <table className="table mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Interest</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => <ParticipantRow key={p.id} tripId={trip.id} p={p} />)}
            </tbody>
          </table>
          <form onSubmit={e => {e.preventDefault(); addParticipant(trip.id, name); setName('');}} className="row g-2">
            <div className="col">
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Participant name" required />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" type="submit">Add</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Dive Trip Organizer</h1>
      <form onSubmit={addTrip} className="row g-3 mb-4">
        <div className="col-md-4">
          <input className="form-control" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Cost" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
        </div>
        <div className="col-12">
          <textarea className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Min" value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Max" value={form.max} onChange={e => setForm({...form, max: e.target.value})} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary" type="submit">Create Trip</button>
        </div>
      </form>

      <h2>Upcoming Trips</h2>
      {upcoming.map(t => <TripCard key={t.id} trip={t} />)}

      <h2 className="mt-4">Past Trips</h2>
      {past.map(t => <TripCard key={t.id} trip={t} />)}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
