const { useState, useEffect } = React;

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

  useEffect(() => { saveTrips(trips); }, [trips]);

  function addTrip(e) {
    e.preventDefault();
    const newTrip = { ...form, id: Date.now(), participants: [] };
    setTrips([...trips, newTrip]);
    setForm({ title: '', date: '', location: '', cost: 135, description: '', min: 4, max: 9 });
  }

  function deleteTrip(id) {
    setTrips(trips.filter(t => t.id !== id));
  }

  function addParticipant(tripId, name) {
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        t.participants.push({ id: Date.now(), name, interest: 'interested', payment: 'unpaid' });
      }
      return t;
    }));
  }

  function toggleInterest(tripId, pid) {
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
  }

  function togglePayment(tripId, pid) {
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
  }

  function removeParticipant(tripId, pid) {
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
