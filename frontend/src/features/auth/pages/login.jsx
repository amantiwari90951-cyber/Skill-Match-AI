import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const response = await handleLogin({ email, password });

    if (response?.user) {
      navigate("/");
      return;
    }

    setErrorMessage(response?.message || "Unable to log in. Please try again.");
  };

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-shell auth-shell--loading">
          <div className="spinner" aria-label="Loading" />
          <h1>Preparing your workspace...</h1>
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
          <h1>Welcome back</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <button className="button primary-button" type="submit" disabled={loading}>
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;