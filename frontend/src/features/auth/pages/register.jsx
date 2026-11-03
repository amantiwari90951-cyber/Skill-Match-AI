import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import "../auth.form.scss";

export default function Register() {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const response = await handleRegister({ username, email, password });

    if (response?.user) {
      navigate("/");
      return;
    }

    setErrorMessage(response?.message || "Unable to create your account. Please try again.");
  };

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-shell auth-shell--loading">
          <div className="spinner" aria-label="Loading" />
          <h1>Setting up your profile...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <header className="auth-page__header">
        <span className="auth-page__brand">SKILL MATCH AI</span>
      </header>

      <div className="auth-shell">
        <div className="auth-brand">
          <h1>Create account</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <button className="button primary-button" type="submit" disabled={loading}>
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
