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
        <h2>
          One platform.
          <br />
          <span>Every journey.</span>
        </h2>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            number={service.number}
            title={service.title}
            description={service.description}
            image={service.image}
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
}) {
  return (
    <Link to="/booking" className="service-card">

      {/* Full card image */}
      <img
        src={image}
        alt={title}
        className="service-image"
      />

      {/* Dark gradient */}
      <div className="service-overlay"></div>

      {/* Text on image */}
      <div className="service-content">

        <span className="service-number">
          {number}
        </span>

        <div className="service-bottom">

          <div className="service-info">
            <h3>{title}</h3>

            <p>{description}</p>
          </div>

          <ArrowUpRight
            className="service-arrow"
            size={30}
          />

        </div>

      </div>

    </Link>
  );
}

export default Services;