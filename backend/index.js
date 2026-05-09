require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'orange-secret-key';

app.use(cors());
app.use(bodyParser.json());

initDb();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.get('/api/profile', authenticateToken, (req, res) => {
    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
});

app.put('/api/profile', authenticateToken, (req, res) => {
    db.get('users').find({ id: req.user.id }).assign(req.body).write();
    res.json({ message: 'Profile updated' });
});
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.get('users').find({ username }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { username: user.username, real_name: user.real_name, role: user.role } });
});

// Invitations CRUD
app.get('/api/invitations', authenticateToken, (req, res) => {
    res.json(db.get('invitations').value());
});
app.post('/api/invitations', authenticateToken, (req, res) => {
    const sources = ['BOSS直聘', '猎聘网', '内部推荐', '拉勾网', '领英'];
    const newItem = { 
        id: Date.now(), 
        source: req.body.source || sources[Math.floor(Math.random() * sources.length)],
        ...req.body, 
        time: new Date().toLocaleString() 
    };
    db.get('invitations').push(newItem).write();
    res.status(201).json(newItem);
});
app.put('/api/invitations/:id', authenticateToken, (req, res) => {
    db.get('invitations').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ message: 'Updated' });
});
app.delete('/api/invitations/:id', authenticateToken, (req, res) => {
    db.get('invitations').remove({ id: parseInt(req.params.id) }).write();
    res.json({ message: 'Deleted' });
});

// Jobs CRUD
app.get('/api/jobs', authenticateToken, (req, res) => {
    res.json(db.get('jobs').value());
});
app.post('/api/jobs', authenticateToken, (req, res) => {
    const newItem = { id: Date.now(), apply_count: 0, interview_count: 0, time: new Date().toISOString().split('T')[0], ...req.body };
    db.get('jobs').push(newItem).write();
    res.status(201).json(newItem);
});
app.put('/api/jobs/:id', authenticateToken, (req, res) => {
    db.get('jobs').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ message: 'Updated' });
});

// Messages
app.get('/api/messages', authenticateToken, (req, res) => {
    res.json(db.get('messages').value());
});
app.post('/api/messages', authenticateToken, (req, res) => {
    const newMessage = { id: Date.now(), unread: 1, ...req.body };
    db.get('messages').push(newMessage).write();
    res.status(201).json(newMessage);
});
app.post('/api/messages/read/:id', authenticateToken, (req, res) => {
    db.get('messages').find({ id: parseInt(req.params.id) }).assign({ unread: 0 }).write();
    res.json({ message: 'Marked as read' });
});
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    db.get('messages').remove({ id: parseInt(req.params.id) }).write();
    res.json({ message: 'Message deleted' });
});

// Memos
app.get('/api/memos', authenticateToken, (req, res) => {
    res.json(db.get('memos').value());
});
app.post('/api/memos', authenticateToken, (req, res) => {
    const newItem = { id: Date.now(), date: '今天', ...req.body };
    db.get('memos').push(newItem).write();
    res.status(201).json(newItem);
});
app.put('/api/memos/:id', authenticateToken, (req, res) => {
    db.get('memos').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ message: 'Updated' });
});
app.delete('/api/memos/:id', authenticateToken, (req, res) => {
    db.get('memos').remove({ id: parseInt(req.params.id) }).write();
    res.json({ message: 'Deleted' });
});

// Favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
    res.json(db.get('favorites').value());
});
app.post('/api/favorites', authenticateToken, (req, res) => {
    const newItem = { id: Date.now(), ...req.body };
    db.get('favorites').push(newItem).write();
    res.status(201).json(newItem);
});
app.delete('/api/favorites/:id', authenticateToken, (req, res) => {
    db.get('favorites').remove({ id: parseInt(req.params.id) }).write();
    res.json({ message: 'Deleted from favorites' });
});

// Interviews CRUD
app.get('/api/interviews', authenticateToken, (req, res) => {
    res.json(db.get('interviews').value());
});
app.post('/api/interviews', authenticateToken, (req, res) => {
    const newItem = { id: Date.now(), ...req.body };
    db.get('interviews').push(newItem).write();
    res.status(201).json(newItem);
});
app.put('/api/interviews/:id', authenticateToken, (req, res) => {
    db.get('interviews').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ message: 'Updated' });
});
app.delete('/api/interviews/:id', authenticateToken, (req, res) => {
    db.get('interviews').remove({ id: parseInt(req.params.id) }).write();
    res.json({ message: 'Deleted' });
});

// Org Chart & Employees
app.get('/api/departments', authenticateToken, (req, res) => {
    const departments = db.get('departments').value();
    const employees = db.get('employees').value();
    const departmentsWithCount = departments.map(d => ({
        ...d,
        count: employees.filter(e => e.dept === d.name).length
    }));
    res.json(departmentsWithCount);
});
app.get('/api/employees', authenticateToken, (req, res) => {
    res.json(db.get('employees').value());
});
app.put('/api/employees/:id', authenticateToken, (req, res) => {
    db.get('employees').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ message: 'Employee updated successfully' });
});

// Stats
app.get('/api/stats/overview', authenticateToken, (req, res) => {
    const invitations = db.get('invitations').value();
    const jobs = db.get('jobs').value();
    const interviews = db.get('interviews').value();
    res.json({
        totalInvitations: invitations.length + 1200,
        currentInterviews: interviews.filter(i => i.status === '进行中').length,
        monthlyHires: 18,
        activeJobs: jobs.filter(j => j.status === '招聘中').length,
        todayTasks: interviews.slice(0, 3).map(i => ({
            time: i.time.split(' ')[1] || '10:00',
            task: `面试：候选人${i.name} - ${i.job}`,
            type: i.type
        }))
    });
});

app.get('/api/stats/personal', authenticateToken, (req, res) => {
    const invitations = db.get('invitations').value() || [];
    const interviews = db.get('interviews').value() || [];
    
    const baseInv = invitations.length + 140;
    const baseInt = interviews.length + 35;
    const reachRate = ((baseInt / baseInv) * 100 * 3.5).toFixed(1); // Mock ratio scaling

    res.json({
        reachRate: Math.min(reachRate, 98.5),
        monthlyInvitations: baseInv,
        monthlyInterviews: baseInt,
        monthlyHires: Math.floor(baseInt * 0.15) + 2,
        invitationChange: '+12.5%',
        interviewChange: '+5.4%',
        hireChange: '-2.1%',
        trends: {
            week: [12, 19, 15, 22, 18, 25, 21],
            month: [45, 52, 48, 65, 55, 62, 58, 70, 65, 72, 60, 75]
        }
    });
});

app.get('/api/stats/interview-viz', authenticateToken, (req, res) => {
    const invitations = db.get('invitations').value() || [];
    const interviews = db.get('interviews').value() || [];
    
    const sources = ['BOSS直聘', '猎聘网', '内部推荐', '拉勾网', '领英'];
    const sourceStats = {
        labels: sources,
        hired: sources.map(s => invitations.filter(inv => inv.source === s && interviews.some(i => i.name === inv.name && i.status === '已通过')).length + Math.floor(Math.random() * 5)),
        rejected: sources.map(s => invitations.filter(inv => inv.source === s && interviews.some(i => i.name === inv.name && i.status === '未通过')).length + Math.floor(Math.random() * 10))
    };

    res.json({
        sourceOutcome: sourceStats,
        scoreHeatmap: [
            { name: '王健', scores: [8, 9, 7, 9, 6, 8] },
            { name: '马丽', scores: [9, 8, 9, 7, 8, 9] },
            { name: '陈兵', scores: [7, 7, 8, 6, 7, 7] },
            { name: '赵敏', scores: [8, 9, 8, 8, 9, 8] }
        ],
        efficiencyRank: [
            { name: '王健', count: interviews.filter(i => i.interviewer === '王健').length + 42, rate: 15, avgTime: '2.5d' },
            { name: '马丽', count: interviews.filter(i => i.interviewer === '马丽').length + 38, rate: 32, avgTime: '1.2d' },
            { name: '陈兵', count: interviews.filter(i => i.interviewer === '陈兵').length + 29, rate: 21, avgTime: '3.1d' },
            { name: '赵敏', count: interviews.filter(i => i.interviewer === '赵敏').length + 25, rate: 18, avgTime: '2.8d' }
        ]
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
