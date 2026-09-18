import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

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
        <ServiceCard
          number="01"
          title="City Rides"
          description="Quick and comfortable rides for your everyday journeys."
          imgsrc="/images/city-rides.jpg"
        />

        <ServiceCard
          number="02"
          title="Airport Transfers"
          description="On-time airport pickups and drop-offs without the stress."
          imgsrc="/images/airport.jpg"
        />

        <ServiceCard
          number="03"
          title="Outstation"
          description="Travel beyond the city with comfortable long-distance rides."
          imgsrc="/images/outstation.jpg"
        />

        <ServiceCard
          number="04"
          title="Corporate"
          description="Professional transportation for businesses and teams."
          imgsrc="/images/corporate.jpg"
        />
      </div>
    </section>
  );
}

function ServiceCard({ number, title, description , imgsrc }) {
  return (
    <Link to="/booking" className="service-card">

      <img src={imgsrc} alt={title} classname="service-image" />
      
      <span className="service-number">{number}</span>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <ArrowUpRight className="service-arrow" size={22} />
    </Link>
  );
}

export default Services;