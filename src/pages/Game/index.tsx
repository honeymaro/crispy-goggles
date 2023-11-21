import { css } from "@emotion/react";
import styled from "@emotion/styled";
import useQueryState from "hooks/useQueryState";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import imgBalloon from "assets/react.svg";

const Grid = styled.div<{ level: number }>`
  width: 80vw;
  max-width: min(80vh, 80vw);
  position: relative;
  display: grid;
  ${({ level }) =>
    css`
      grid-template-columns: repeat(${level}, 1fr);
    `}
`;

const Item = styled.button<{ hasBalloon: boolean }>`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background-color: transparent;
  border: 1px solid black;
  outline: none;
  font-size: 0;
  ${({ hasBalloon }) =>
    hasBalloon &&
    css`
      cursor: pointer;
      background-image: url(${imgBalloon});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    `}
`;

const GameOverOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function makeData(level: number) {
  const data = new Array(level * level)
    .fill(false)
    .map(() => Math.random() > 0.6);
  return data;
}

function getGroups(data: boolean[]) {
  const level = Math.sqrt(data.length);

  const groups: number[] = new Array(data.length).fill(-1);
  let groupId = 0;

  function findSiblingsAndSetGroupTo(index: number, newGroupId: number) {
    if (index % level > 0 && data[index - 1] && groups[index - 1] < 0) {
      groups[index - 1] = newGroupId;
      findSiblingsAndSetGroupTo(index - 1, newGroupId);
    }
    if (index % level < level - 1 && data[index + 1] && groups[index + 1] < 0) {
      groups[index + 1] = newGroupId;
      findSiblingsAndSetGroupTo(index + 1, newGroupId);
    }
    if (
      index - level >= 0 &&
      data[index - level] &&
      groups[index - level] < 0
    ) {
      groups[index - level] = newGroupId;
      findSiblingsAndSetGroupTo(index - level, newGroupId);
    }
    if (
      index + level < data.length &&
      data[index + level] &&
      groups[index + level] < 0
    ) {
      groups[index + level] = newGroupId;
      findSiblingsAndSetGroupTo(index + level, newGroupId);
    }
  }

  data.forEach((item, index) => {
    if (item) {
      if (groups[index] >= 0) {
        return true;
      }
      if (
        (index % level === 0 || groups[index - 1] < 0) &&
        (index % level === level - 1 || groups[index + 1] < 0) &&
        (index - level < 0 || groups[index - level] < 0) &&
        (index + level >= data.length || groups[index + level] < 0)
      ) {
        groups[index] = groupId++;
        findSiblingsAndSetGroupTo(index, groups[index]);
      }
    }
  });
  return groups;
}

function getGroupCounts(groups: number[]) {
  const groupCounts = groups.reduce((prev, curr) => {
    if (curr >= 0) {
      if (!prev[curr]) {
        prev[curr] = 0;
      }
      prev[curr] += 1;
    }
    return prev;
  }, [] as number[]);
  return groupCounts;
}

function getBiggestGroupId(groups: number[]) {
  const groupCounts = getGroupCounts(groups);
  return groupCounts.indexOf(Math.max(...groupCounts));
}

function removeSiblings(data: boolean[], index: number) {
  const groups = getGroups(data);

  const groupId = groups[index];
  return data.map((item, index) => (groups[index] === groupId ? false : item));
}

function checkIsValidClick(data: boolean[], clickedIndex: number) {
  const groups = getGroups(data);
  const groupCounts = getGroupCounts(groups);
  const biggestGroupId = getBiggestGroupId(groups);

  return groupCounts[biggestGroupId] === groupCounts[groups[clickedIndex]];
}

function checkIsGameDone(data: boolean[]) {
  return data.findIndex((item) => item) < 0;
}

function GamePage() {
  const navigate = useNavigate();
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useQueryState<{
    level: number;
    data?: boolean[];
  }>("q", {
    level: 4,
  });

  const handleClick = (index: number) => {
    if (!gameState.data || !gameState.data[index]) return;
    const isValid = checkIsValidClick(gameState.data, index);

    if (!isValid) {
      setIsGameOver(true);
      return;
    }

    setGameState((current) => ({
      ...current,
      data: current.data ? removeSiblings(current.data, index) : undefined,
    }));
  };

  useEffect(() => {
    if (
      Number.isNaN(gameState.level) ||
      gameState.level <= 0 ||
      gameState.level > 50
    ) {
      alert("Invalid level. Level must be between 1 and 50.");
      navigate("/home", { replace: true });
    }
  }, [gameState.level, navigate]);

  useEffect(() => {
    if (gameState.level && !gameState.data) {
      setGameState((state) => ({
        ...state,
        data: makeData(gameState.level),
      }));
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    if (gameState.data && checkIsGameDone(gameState.data)) {
      setGameState((current) => ({
        ...current,
        level: current.level + 1,
        data: undefined,
      }));
    }
  }, [gameState, setGameState]);

  return (
    <div>
      <h2>Level: {gameState.level}</h2>
      <Grid level={gameState.level}>
        {gameState.data?.map((item, index) => (
          <Item
            key={index}
            onClick={() => handleClick(index)}
            hasBalloon={item}
          />
        ))}
      </Grid>
      {isGameOver && (
        <GameOverOverlay>
          <h1>Game Over</h1>
          <button
            onClick={() => {
              setIsGameOver(false);
              setGameState((current) => ({
                ...current,
                data: makeData(current.level),
              }));
            }}
          >
            Retry
          </button>
          <Link to="/home" replace>
            <button>Home</button>
          </Link>
        </GameOverOverlay>
      )}
    </div>
  );
}

export default GamePage;
