const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/nbapool';
mongoose.connect(mongoUrl, { useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Trust Proxy for Render
app.set('trust proxy', 1);

// CORS Configuration
app.use(cors({
    origin: 'https://nbapool2025.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Session Configuration
app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'your-secure-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        autoRemoveInterval: 10
    }, (err) => {
        if (err) console.error('MongoStore error:', err);
        else console.log('MongoStore initialized');
    }),
    cookie: {
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        domain: 'nbapool2025.onrender.com'
    },
    proxy: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d' // Cache static files for 1 day
}));

// Debug Headers
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - SessionID: ${req.sessionID}, UserId: ${req.session.userId}, Cookie: ${req.headers.cookie || 'none'}`);
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Response Headers:', JSON.stringify(res.getHeaders(), null, 2));
    next();
});

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    comments: String,
    paymentMethod: String,
    playin: Object,
    firstRoundEast: Object,
    firstRoundWest: Object,
    semifinals: Object,
    conferenceFinals: Object,
    finals: Object
});
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/playin.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'playin.html')));
app.get('/firstround_east.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'firstround_east.html')));
app.get('/firstround_west.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'firstround_west.html')));
app.get('/semifinals.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'semifinals.html')));
app.get('/conferencefinals.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'conferencefinals.html')));
app.get('/finals.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'finals.html')));
app.get('/summary.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'summary.html')));

app.post('/submit-registration', async (req, res) => {
    console.log('Registration attempt:', req.body);
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.paymentMethod) {
        return res.status(400).json({ error: 'All fields except comments are required' });
    }
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id.toString();
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to save session' });
            }
            console.log('Session saved successfully with UserId:', req.session.userId);
            res.set('Set-Cookie', `connect.sid=${req.sessionID}; HttpOnly; Secure; SameSite=None; Domain=nbapool2025.onrender.com; Path=/; Max-Age=86400`);
            res.json({ message: 'Registration successful' });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.get('/get-playin', async (req, res) => {
    console.log('Get Play-In request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-playin - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.playin || { east7: '', east8: '', west7: '', west8: '' });
    } catch (error) {
        console.error('Error fetching Play-In data:', error);
        res.status(500).json({ error: 'Server error fetching Play-In data' });
    }
});

app.post('/submit-playin', async (req, res) => {
    console.log('Submit Play-In request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { playin: req.body },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Play-In data saved successfully' });
    } catch (error) {
        console.error('Error saving Play-In data:', error);
        res.status(500).json({ error: 'Server error saving Play-In data' });
    }
});

app.get('/get-firstround-east', async (req, res) => {
    console.log('Get First Round East request:', { 
        sessionId: req.sessionID, 
        userId: req.session.userId, 
        session: req.session 
    });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-firstround-east - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        const defaultData = { matchup1: '', matchup2: '', matchup3: '', matchup4: '' };
        const playinData = user.playin || { east7: '7th Seed', east8: '8th Seed' };
        const responseData = {
            firstRoundEast: user.firstRoundEast ? { ...defaultData, ...user.firstRoundEast } : defaultData,
            playin: {
                east7: playinData.east7 || '7th Seed',
                east8: playinData.east8 || '8th Seed'
            }
        };
        console.log('Returning First Round East data:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching First Round East data:', error);
        res.status(500).json({ error: 'Server error fetching First Round East data' });
    }
});

app.post('/submit-firstround-east', async (req, res) => {
    console.log('Submit First Round East request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { firstRoundEast: req.body.firstRoundEast },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'First Round East data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round East data:', error);
        res.status(500).json({ error: 'Server error saving First Round East data' });
    }
});

app.get('/get-firstround-west', async (req, res) => {
    console.log('Get First Round West request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-firstround-west - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.firstRoundWest || {});
    } catch (error) {
        console.error('Error fetching First Round West data:', error);
        res.status(500).json({ error: 'Server error fetching First Round West data' });
    }
});

app.post('/submit-firstround-west', async (req, res) => {
    console.log('Submit First Round West request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { firstRoundWest: req.body.firstRoundWest },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'First Round West data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round West data:', error);
        res.status(500).json({ error: 'Server error saving First Round West data' });
    }
});

app.get('/get-semifinals', async (req, res) => {
    console.log('Get Semifinals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-semifinals - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.semifinals || {});
    } catch (error) {
        console.error('Error fetching Semifinals data:', error);
        res.status(500).json({ error: 'Server error fetching Semifinals data' });
    }
});

app.post('/submit-semifinals', async (req, res) => {
    console.log('Submit Semifinals request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { semifinals: req.body.semifinals },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Semifinals data saved successfully' });
    } catch (error) {
        console.error('Error saving Semifinals data:', error);
        res.status(500).json({ error: 'Server error saving Semifinals data' });
    }
});

app.get('/get-conferencefinals', async (req, res) => {
    console.log('Get Conference Finals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-conferencefinals - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.conferenceFinals || {});
    } catch (error) {
        console.error('Error fetching Conference Finals data:', error);
        res.status(500).json({ error: 'Server error fetching Conference Finals data' });
    }
});

app.post('/submit-conferencefinals', async (req, res) => {
    console.log('Submit Conference Finals request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { conferenceFinals: req.body.conferenceFinals },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Conference Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Conference Finals data:', error);
        res.status(500).json({ error: 'Server error saving Conference Finals data' });
    }
});

app.post('/submit-finals', async (req, res) => {
    console.log('Submit Finals request:', { sessionId: req.sessionID, userId: req.session.userId, body: req.body });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { finals: req.body.finals },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Finals data:', error);
        res.status(500).json({ error: 'Server error saving Finals data' });
    }
});

app.get('/get-all-picks', async (req, res) => {
    console.log('Get All Picks request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-all-picks - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            playin: user.playin || {},
            firstRoundEast: user.firstRoundEast || {},
            firstRoundWest: user.firstRoundWest || {},
            semifinals: user.semifinals || {},
            conferenceFinals: user.conferenceFinals || {},
            finals: user.finals || {}
        });
    } catch (error) {
        console.error('Error fetching all picks:', error);
        res.status(500).json({ error: 'Server error fetching all picks' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));