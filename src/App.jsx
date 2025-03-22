import { useState, useEffect } from 'react'
import './App.css'

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [direction, setDirection] = useState('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction])

  useEffect(() => {
    if (gameOver) return
    
    const moveSnake = () => {
      const newSnake = [...snake]
      const head = { ...newSnake[0] }

      switch (direction) {
        case 'UP': head.y--; break
        case 'DOWN': head.y++; break
        case 'LEFT': head.x--; break
        case 'RIGHT': head.x++; break
      }

      // 碰撞检测
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || 
          snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return
      }

      newSnake.unshift(head)
      
      // 吃食物逻辑
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10)
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        })
      } else {
        newSnake.pop()
      }

      setSnake(newSnake)
    }

    const gameInterval = setInterval(moveSnake, 200)
    return () => clearInterval(gameInterval)
  }, [snake, direction, food, gameOver])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)
          const isSnake = snake.some(segment => segment.x === x && segment.y === y)
          const isFood = food.x === x && food.y === y

          return (
            <div 
              key={index}
              className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`}
            />
          )
        })}
      </div>
      {gameOver && <button className="restart-btn" onClick={resetGame}>Restart Game</button>}
    </div>
  )
}

export default App
