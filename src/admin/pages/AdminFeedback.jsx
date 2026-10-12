import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase";

import {
  Check,
  X,
  MessageSquareQuote,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  CalendarDays,
  UserRound,
} from "lucide-react";

import "./AdminFeedback.css";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Read contact form submissions from Firebase
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const feedbackQuery = query(
        collection(db, "contactEnquiries"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(feedbackQuery);

      const feedbackData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setFeedback(feedbackData);
    } catch (err) {
      console.error("Error loading contact enquiries:", err);
      setError(err.message || "Unable to load contact enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-feedback-page">
      {/* HEADER */}
      <div className="admin-feedback-header">
        <div>
          <span className="admin-feedback-eyebrow">
            CUSTOMER EXPERIENCE
          </span>

          <h1>Contact Enquiries</h1>

          <p>
            Read customer messages and manage enquiries submitted
            through your website.
          </p>
        </div>

        <button
          type="button"
          className="feedback-refresh-btn"
          onClick={fetchFeedback}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "feedback-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="feedback-error">
          <strong>Something went wrong</strong>
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="feedback-loading">
          <div className="feedback-loader" />
          <span>Loading contact enquiries...</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && feedback.length === 0 && (
        <div className="feedback-empty">
          <div className="feedback-empty-icon">
            <MessageSquareQuote size={28} />
          </div>

          <h2>No contact enquiries yet</h2>

          <p>
            When someone submits the Contact Us form on your
            website, their details will appear here.
          </p>
        </div>
      )}

      {/* ENQUIRY LIST */}
      {!loading && feedback.length > 0 && (
        <div className="admin-feedback-list">
          {feedback.map((item) => {

            return (
              <article
                className="admin-feedback-card"
                key={item.id}
              >

                {/* PHONE AND EMAIL */}
                <div className="feedback-contact">
                  <div>
                    <span>
                      <Phone size={14} /> PHONE
                    </span>
                    <strong>{item.phone || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>
                      <Mail size={14} /> EMAIL
                    </span>
                    <strong>{item.email || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>
                      <CalendarDays size={14} /> SUBMITTED
                    </span>
                    <strong>{formatDate(item.createdAt)}</strong>
                  </div>
                </div>

                {/* CUSTOMER MESSAGE */}
                <div className="feedback-message">
                  <MessageSquareQuote
                    size={20}
                    strokeWidth={1.5}
                  />

                  <div>
                    <span className="feedback-message-label">
                      CUSTOMER MESSAGE
                    </span>

                    <p>
                      {item.message || "No message provided."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;