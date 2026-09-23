import {
  CalendarCheck,
  Users,
  UserRoundCog,
  Car,
  IndianRupee,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  const stats = [
    {
      title: "Total Bookings",
      value: "248",
      change: "+12.5%",
      icon: CalendarCheck,
    },
    {
      title: "Customers",
      value: "1,284",
      change: "+8.2%",
      icon: Users,
    },
    {
      title: "Active Drivers",
      value: "18",
      change: "+4.1%",
      icon: UserRoundCog,
    },
    {
      title: "Revenue",
      value: "₹84,520",
      change: "+14.8%",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* ================= HEADER ================= */}

      <div className="admin-content-heading">
        <div>
          <span className="admin-eyebrow">OVERVIEW</span>

          <h1>Dashboard</h1>

          <p>Welcome back. Here's what's happening with MANZILL 777.</p>
        </div>

        <div className="admin-dashboard-date">
          <span>▣</span>
          Tuesday, 23 September 2026
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="admin-stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-stat-card" key={stat.title}>
              <div className="admin-stat-top">
                <div className="admin-stat-icon">
                  <Icon size={19} />
                </div>

                <span className="admin-stat-change">{stat.change}</span>
              </div>

              <div className="admin-stat-value">{stat.value}</div>

              <div className="admin-stat-title">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* ================= LOWER GRID ================= */}

      <div className="admin-dashboard-grid">
        {/* BOOKING OVERVIEW */}

        <section className="admin-panel admin-chart-panel">
          <div className="admin-panel-header">
            <div>
              <span>ANALYTICS</span>
              <h2>Booking Overview</h2>
            </div>

            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="admin-chart-placeholder">
            <div className="chart-bars">
              <span style={{ height: "35%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "85%" }} />
              <span style={{ height: "72%" }} />
            </div>

            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </section>

        {/* VEHICLES */}

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>FLEET</span>
              <h2>Vehicles</h2>
            </div>

            <Car size={19} />
          </div>

          <div className="admin-vehicle-list">
            <div className="admin-vehicle-item">
              <div>
                <strong>Sedan</strong>
                <span>8 vehicles</span>
              </div>

              <b>Available</b>
            </div>

            <div className="admin-vehicle-item">
              <div>
                <strong>SUV</strong>
                <span>6 vehicles</span>
              </div>

              <b>Available</b>
            </div>

            <div className="admin-vehicle-item">
              <div>
                <strong>Premium</strong>
                <span>4 vehicles</span>
              </div>

              <b>Available</b>
            </div>
          </div>
        </section>
      </div>

      {/* ================= RECENT BOOKINGS ================= */}

      <section className="admin-panel admin-recent-bookings">
        <div className="admin-panel-header">
          <div>
            <span>ACTIVITY</span>
            <h2>Recent Bookings</h2>
          </div>

          <button className="admin-view-all">
            View all
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>BOOKING</th>
                <th>CUSTOMER</th>
                <th>ROUTE</th>
                <th>VEHICLE</th>
                <th>FARE</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>#1025</td>

                <td>
                  <strong>Rahul Sharma</strong>
                </td>

                <td>Phagwara → Delhi</td>

                <td>Sedan</td>

                <td>₹4,200</td>

                <td>
                  <span className="status confirmed">Confirmed</span>
                </td>
              </tr>

              <tr>
                <td>#1024</td>

                <td>
                  <strong>Aman Kumar</strong>
                </td>

                <td>Phagwara → Chandigarh</td>

                <td>SUV</td>

                <td>₹1,800</td>

                <td>
                  <span className="status pending">Pending</span>
                </td>
              </tr>

              <tr>
                <td>#1023</td>

                <td>
                  <strong>Simran Kaur</strong>
                </td>

                <td>Jalandhar → Amritsar</td>

                <td>Premium</td>

                <td>₹2,400</td>

                <td>
                  <span className="status completed">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
