"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type Schedule = {
  id: string;
  departureAt: string;
  coach: { coachNumber: string };
  route: { slug: string };
};

export default function CounterPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleId, setScheduleId] = useState("");
  const [seatLabels, setSeatLabels] = useState("1A");
  const [boardingPointId, setBoardingPointId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiGet<Schedule[]>("/admin/schedules")
      .then((r) => setSchedules(r.data))
      .catch(() => setMessage("Login as counter: 01700000002 / password123"));
  }, []);

  async function sell() {
    setMessage("");
    try {
      const r = await apiPost<{ ticket: { passengerNumber: string } }>(
        "/counter/sell",
        {
          scheduleId,
          seatLabels: seatLabels.split(",").map((s) => s.trim()),
          boardingPointId,
          passenger: { name, phone },
          method: "CASH",
        },
      );
      setMessage(`Sold! Passenger # ${r.data.ticket?.passengerNumber}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sell failed");
    }
  }

  return (
    <section className="container">
      <h1>Counter POS</h1>
      <article className="card">
        <label>Schedule</label>
        <select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)}>
          <option value="">Select</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.route.slug} — {s.coach.coachNumber} —{" "}
              {new Date(s.departureAt).toLocaleString()}
            </option>
          ))}
        </select>
        <label>Seats (comma separated)</label>
        <input value={seatLabels} onChange={(e) => setSeatLabels(e.target.value)} />
        <label>Boarding point ID</label>
        <input
          value={boardingPointId}
          onChange={(e) => setBoardingPointId(e.target.value)}
        />
        <label>Passenger name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="button" className="btn" onClick={sell}>
          Sell ticket (cash)
        </button>
        {message && <p>{message}</p>}
      </article>
    </section>
  );
}
