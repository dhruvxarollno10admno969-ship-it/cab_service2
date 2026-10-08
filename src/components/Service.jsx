import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./servies.css";

const services = [
  {
    id: 1,
    number: "01",
    title: "City Rides",
    description:
      "Quick and comfortable rides for your everyday journeys.",
    image: "/images/city-rides.jpg",
  },
  {
    id: 2,
    number: "02",
    title: "Airport Transfers",
    description:
      "On-time airport pickups and drop-offs without the stress.",
    image: "/images/airport.jpg",
  },
  {
    id: 3,
    number: "03",
    title: "Outstation",
    description:
      "Travel beyond the city with comfortable long-distance rides.",
    image: "/images/manali.jpg",
  },
  {
    id: 4,
    number: "04",
    title: "Corporate",
    description:
      "Professional transportation for businesses and teams.",
    image: "/images/corporate.jpg",
  },
];

function Services() {
  return (
    <section className="services-section" id="services">

      <div className="section-heading">
        <span className="services-label">
          OUR SERVICES
        </span>

        <h2>
          One platform.
          <br />
          <span>Every journey.</span>
        </h2>

        <p>
          From everyday city rides to long-distance journeys,
          MANZILL 777 makes every trip simple, comfortable and reliable.
        </p>
      </div>

      <div className="services-list">

        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            {...service}
            reverse={index % 2 !== 0}
          />
        ))}

      </div>

    </section>
  );
}

function ServiceCard({
  number,
  title,
  description,
  image,
  reverse,
}) {
  return (
    <Link
      to="/booking"
      className={`service-card ${reverse ? "reverse" : ""}`}
    >

      {/* IMAGE */}
      <div className="service-image-box">
        <img
          src={image}
          alt={title}
          className="service-image"
        />
      </div>

      {/* CONTENT */}
      <div className="service-content">

        <span className="service-number">
          {number}
        </span>

        <div className="service-info">

          <h3>{title}</h3>

          <p>{description}</p>

          <span className="service-link">
            Explore service
            <ArrowUpRight size={18} />
          </span>

        </div>

        <ArrowUpRight
          className="service-arrow"
          size={28}
        />

      </div>

    </Link>
  );
}

export default Services;