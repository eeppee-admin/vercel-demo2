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

  const [apiData, setApiData] = useState('')
  const [leaderboard, setLeaderboard] = useState([])

  // 测试API接口
  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setApiData(data.message))
      .catch(console.error)
  }, [])

  // 初始化时加载排行榜
  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(console.error)
  }, [])

  // 修改后的提交分数函数
  const submitScore = async (name = 'Anonymous') => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })
      });

      if (response.ok) {
        const newData = await response.json();
        setLeaderboard(newData);  // 直接更新排行榜
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  }


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
    loadLeaderboard()
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
      <div className="game-container">
        <div className="api-status">API状态: {apiData || '正在连接...'}</div>
        {gameOver && (
          <div className="game-over-panel">
            <button onClick={() => {
              const name = prompt('输入你的名字') || 'Anonymous';
              submitScore(name);
            }}>
              提交分数
            </button>
            <h3>实时排行榜</h3>
            <ul>
              {leaderboard.slice(0, 5).map((entry, index) => (
                <li key={index}>
                  <span className="rank">{index + 1}.</span>
                  {entry.name} - {entry.score}分
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
