import styled from "@emotion/styled";
import { useState } from "react";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  width: auto;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function HomePage() {
  const [level, setLevel] = useState(4);
  return (
    <Wrapper>
      <h1>Home screen</h1>
      <label>
        Level&nbsp;
        <input
          type="number"
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          style={{ width: 50 }}
        />
      </label>
      <br />
      <Link
        to={{
          pathname: "/game",
          search: `q=${window.btoa(JSON.stringify({ level }))}`,
        }}
      >
        <button>start game</button>
      </Link>
    </Wrapper>
  );
}

export default HomePage;
