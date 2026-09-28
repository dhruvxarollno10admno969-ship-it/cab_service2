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
} from "lucide-react";

import "./AdminFeedback.css";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const feedbackQuery = query(
        collection(db, "feedback"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(feedbackQuery);

      const feedbackData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error loading feedback:", error);
      setError(error.message || "Unable to load feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      await updateDoc(doc(db, "feedback", id), {
        status,
      });

      setFeedback((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert(`Unable to update feedback: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatus = (item) => {
    // Existing feedback that was created before
    // status was introduced will be treated as pending.
    return item.status || "pending";
  };

  const pendingCount = feedback.filter(
    (item) => getStatus(item) === "pending"
  ).length;

  const approvedCount = feedback.filter(
    (item) => getStatus(item) === "approved"
  ).length;

  const rejectedCount = feedback.filter(
    (item) => getStatus(item) === "rejected"
  ).length;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Recently";

    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

          <h1>Feedback</h1>

          <p>
            Review customer feedback before publishing it
            on the website.
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

      {/* STATS */}
      <div className="feedback-stats">

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon pending">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon approved">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon rejected">
            <XCircle size={20} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon total">
            <MessageSquareQuote size={20} />
          </div>

          <div>
            <span>Total</span>
            <strong>{feedback.length}</strong>
          </div>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="feedback-error">
          <strong>Unable to load feedback</strong>
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="feedback-loading">
          <div className="feedback-loader"></div>
          <span>Loading feedback...</span>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && feedback.length === 0 && (
        <div className="feedback-empty">
          <div className="feedback-empty-icon">
            <MessageSquareQuote size={28} />
          </div>

          <h2>No feedback yet</h2>

          <p>
            Customer feedback submitted from the website
            will appear here.
          </p>
        </div>
      )}

      {/* FEEDBACK LIST */}
      {!loading && feedback.length > 0 && (
        <div className="admin-feedback-list">

          {feedback.map((item) => {
            const status = getStatus(item);

            return (
              <article
                className="admin-feedback-card"
                key={item.id}
              >

                {/* CARD TOP */}
                <div className="feedback-card-top">

                  <div className="feedback-customer">
                    <div className="feedback-avatar">
                      {item.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <h3>
                        {item.name || "Unknown Customer"}
                      </h3>

                      <span>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`feedback-status ${status}`}
                  >
                    {status === "pending" && (
                      <>
                        <Clock3 size={14} />
                        Pending
                      </>
                    )}

                    {status === "approved" && (
                      <>
                        <CheckCircle2 size={14} />
                        Approved
                      </>
                    )}

                    {status === "rejected" && (
                      <>
                        <XCircle size={14} />
                        Rejected
                      </>
                    )}
                  </div>

                </div>

                {/* MESSAGE */}
                <div className="feedback-message">
                  <MessageSquareQuote
                    size={20}
                    strokeWidth={1.5}
                  />

                  <p>
                    {item.message || "No message provided."}
                  </p>
                </div>

                {/* CONTACT INFO */}
                <div className="feedback-contact">

                  <div>
                    <span>PHONE</span>
                    <strong>
                      {item.phone || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>EMAIL</span>
                    <strong>
                      {item.email || "Not provided"}
                    </strong>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="feedback-actions">

                  {status !== "approved" && (
                    <button
                      type="button"
                      className="feedback-approve"
                      onClick={() =>
                        updateStatus(item.id, "approved")
                      }
                      disabled={updatingId === item.id}
                    >
                      <Check size={17} />

                      {updatingId === item.id
                        ? "Updating..."
                        : "Approve"}
                    </button>
                  )}

                  {status !== "rejected" && (
                    <button
                      type="button"
                      className="feedback-reject"
                      onClick={() =>
                        updateStatus(item.id, "rejected")
                      }
                      disabled={updatingId === item.id}
                    >
                      <X size={17} />

                      Reject
                    </button>
                  )}

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