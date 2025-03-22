let leaderboard = [];

export default function handler(req, res) {
    // 添加CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'POST') {
        const { name, score } = req.body;
        leaderboard.push({ name, score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10); // 保留前十
        return res.status(201).json(leaderboard);
    }

    if (req.method === 'GET') {
        return res.status(200).json(leaderboard);
    }

    res.status(405).json({ message: 'Method not allowed' });
}