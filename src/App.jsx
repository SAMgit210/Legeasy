import { useState } from "react";
import "./App.css";
const API_URL = "https://legeasy-backend.vercel.app";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [clauses, setClauses] = useState([]);
  const [explanations, setExplanations] = useState({});
  const [loadingClause, setLoadingClause] = useState(null);

  // Test backend
  const testBackend = () => {
    fetch(`${API_URL}/`)
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.log("Backend error:", error);
        setMessage("Backend connection failed");
      });
  };

  // Upload PDF
  const uploadDocument = () => {
    if (!selectedFile) {
      alert("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);

    setMessage("Processing document...");

    fetch(`${API_URL}/api/documents/upload`, {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setClauses(data.clauses || []);
      })
      .catch((error) => {
        console.log("Upload error:", error);
        setMessage("Failed to upload document");
      });
  };

  // Explain clause
  const explainClause = (clauseText, index) => {
    setLoadingClause(index);

    fetch(`${API_URL}/api/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        clause: clauseText
      })
    })
      .then((response) => response.json())
      .then((data) => {
        setExplanations((previous) => ({
          ...previous,
          [index]: data.explanation || data.message
        }));
      })
      .catch((error) => {
        console.log("AI error:", error);

        setExplanations((previous) => ({
          ...previous,
          [index]: "Unable to generate explanation."
        }));
      })
      .finally(() => {
        setLoadingClause(null);
      });
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span>⚖</span> LegEasy
        </div>

        <div className="header-tag">
          Legal Document Assistant
        </div>
      </header>


      {/* Hero Section */}
      <main className="container">

        <section className="hero">
          <div className="hero-badge">
            AI-Powered Document Analysis
          </div>

          <h1>
            Understand Your
            <span> Legal Documents</span>
          </h1>

          <p>
            Upload a legal document and turn complex clauses
            into simple, easy-to-understand explanations.
          </p>
        </section>


        {/* Upload Card */}
        <section className="upload-card">

          <div className="upload-icon">
            📄
          </div>

          <h2>Upload your document</h2>

          <p>
            Select a PDF file to analyze its clauses and identify
            potential risk levels.
          </p>

          <div className="upload-area">

            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                const file = event.target.files[0];

                if (file && file.type === "application/pdf") {
                  setSelectedFile(file);
                  setMessage("");
                } else {
                  alert("Please select a PDF file");
                  setSelectedFile(null);
                }
              }}
            />

            <label htmlFor="fileInput" className="choose-button">
              Choose PDF
            </label>

            {selectedFile && (
              <div className="selected-file">
                <span>✓</span>
                {selectedFile.name}
              </div>
            )}

          </div>

          <button
            className="upload-button"
            onClick={uploadDocument}
          >
            Analyze Document →
          </button>

        </section>


        {/* Status */}
        {message && (
          <div className="status">
            <span>✓</span>
            {message}
          </div>
        )}


        {/* Backend test - keep for development */}
        <button
          className="backend-button"
          onClick={testBackend}
        >
          Test Backend Connection
        </button>


        {/* Clauses */}
        {clauses.length > 0 && (
          <section className="results">

            <div className="results-header">
              <div>
                <div className="section-label">
                  DOCUMENT ANALYSIS
                </div>

                <h2>Analyzed Clauses</h2>
              </div>

              <div className="clause-count">
                {clauses.length}{" "}
                {clauses.length === 1 ? "Clause" : "Clauses"}
              </div>
            </div>


            {clauses.map((clause, index) => (

              <div className="clause-card" key={index}>

                <div className="clause-top">

                  <h3>
                    Clause {index + 1}
                  </h3>

                  <span
                    className={`risk ${clause.risk.toLowerCase()}`}
                  >
                    {clause.risk} RISK
                  </span>

                </div>


                <p className="clause-text">
                  {clause.text}
                </p>


                <button
                  className="explain-button"
                  onClick={() =>
                    explainClause(clause.text, index)
                  }
                >
                  {loadingClause === index
                    ? "Generating explanation..."
                    : "✦ Explain with AI"}
                </button>


                {explanations[index] && (
                  <div className="explanation">

                    <div className="explanation-title">
                      <span>✦</span>
                      AI Explanation
                    </div>

                    <p>
                      {explanations[index]}
                    </p>

                  </div>
                )}

              </div>

            ))}

          </section>
        )}

      </main>


      {/* Footer */}
      <footer>
        <p>
          LegEasy • Simplifying complex legal language
        </p>
      </footer>

    </div>
  );
}

export default App;