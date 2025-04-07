import { Link } from "react-router-dom";
import "../styles.css"; 

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Welcome to the EHR DApp</h1>
        <p className="description">
          you are secure, decentralized, private and transparent
        </p>
        <Link to="/dashboard" className="button">
          Get Started
        </Link>
      </div>
    </div>
  );
}
