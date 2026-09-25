import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">

        <span className="not-found-small">
          ERROR 404
        </span>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you're looking for doesn't exist
          or may have been moved.
        </p>

        <div className="not-found-buttons">

          <button
            className="not-found-home"
            onClick={() => navigate("/")}
          >
            <Home size={18} />
            Go Home
          </button>

          <button
            className="not-found-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

        </div>

      </div>
    </div>
  );
}

export default NotFound;