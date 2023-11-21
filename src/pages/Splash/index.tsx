import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  }, [navigate]);

  return (
    <div>
      <h1>Splash Page</h1>
    </div>
  );
}

export default SplashPage;
