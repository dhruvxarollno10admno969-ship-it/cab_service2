import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  MessageSquareQuote,
} from "lucide-react";
import Title from "./Title";
import {
  collection,
  getDocs,
  query,
  where,
  
} from "firebase/firestore";

import { db } from "../../firebase";  

import "../styles/Testimonials.css";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const testimonialsQuery = query(
  collection(db, "feedback"),
  where("status", "==", "approved")
);

        const snapshot = await getDocs(testimonialsQuery);

        const approvedTestimonials = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTestimonials(approvedTestimonials);
      } catch (error) {
        console.error("Error loading testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section
      className="testimonials-section"
      id="testimonials"
    >
      <div className="testimonials-container">


         <Title
        label="CUSTOMER STORIES"
        title="Good rides."
        highlight="Better experiences."
        description="Hear what our riders have to say about their journeywith us."
      />

        {/* Loading */}
        {loading ? (
          <div className="testimonials-empty">
            <div className="testimonials-empty-icon">
              <MessageSquareQuote
                size={28}
                strokeWidth={1.3}
              />
            </div>

            <div className="testimonials-empty-content">
              <span>LOADING EXPERIENCES</span>

              <h3>
                Loading
                <br />
                <em>customer stories.</em>
              </h3>

              <p>
                Please wait while we load approved customer
                feedback.
              </p>
            </div>

            <div className="testimonials-empty-number">
              01
            </div>
          </div>
        ) : testimonials.length > 0 ? (
          /* Testimonials */
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <article
                className="testimonial-card"
                key={testimonial.id}
              >
                <div className="testimonial-card-top">
                  <div className="testimonial-quote-icon">
                    <MessageSquareQuote
                      size={22}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Rating */}
                  {testimonial.rating ? (
                    <div className="testimonial-rating">
                      {"★".repeat(testimonial.rating)}
                    </div>
                  ) : null}
                </div>

                <p className="testimonial-message">
                  {testimonial.message}
                </p>

                <div className="testimonial-divider"></div>

                <div className="testimonial-footer">
                  <div>
                    <h3>{testimonial.name}</h3>

                    <span>
                      Verified Ride
                    </span>
                  </div>

                  <div className="testimonial-arrow">
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="testimonials-empty">
            <div className="testimonials-empty-icon">
              <MessageSquareQuote
                size={28}
                strokeWidth={1.3}
              />
            </div>

            <div className="testimonials-empty-content">
              <span>YOUR EXPERIENCE MATTERS</span>

              <h3>
                Be the first to
                <br />
                <em>share your ride.</em>
              </h3>

              <p>
                Customer feedback will appear here after riders
                share their experience with us.
              </p>
            </div>

            <div className="testimonials-empty-number">
              01
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;