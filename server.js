const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware with enhanced logging
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nba_pool',
        ttl: 24 * 60 * 60 // 1 day in seconds
    }),
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        sameSite: 'lax'
    }
}));

// Log session middleware setup
app.use((req, res, next) => {
    console.log('Session middleware - SessionID:', req.sessionID);
    console.log('Session middleware - Session:', req.session);
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nba_pool', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    comments: String,
    paymentMethod: String,
    playin: Object,
    firstRoundEast: {
        matchup1: String,
        matchup2: String,
        matchup3: String,
        matchup4: String,
        series1: String,
        series2: String,
        series3: String,
        series4: String
    },
    firstRoundWest: {
        matchup1: String,
        matchup2: String,
        matchup3: String,
        matchup4: String,
        series1: String,
        series2: String,
        series3: String,
        series4: String
    },
    semifinals: {
        east1: String,
        east2: String,
        west1: String,
        west2: String,
        eastSeries1: String,
        eastSeries2: String,
        westSeries1: String,
        westSeries2: String
    },
    conferenceFinals: {
        eastWinner: String,
        westWinner: String,
        eastSeries: String,
        westSeries: String
    },
    finals: {
        champion: String,
        mvp: String,
        finalScore: String,
	seriesLength: String
    }
});

const User = mongoose.model('User', userSchema);

// Routes

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/playin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'playin.html'));
});

app.get('/firstround_east.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'firstround_east.html'));
});

app.get('/firstround_west.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'firstround_west.html'));
});

app.get('/semifinals.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'semifinals.html'));
});

app.get('/conferencefinals.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'conferencefinals.html'));
});

app.get('/finals.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'finals.html'));
});

app.get('/summary.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'summary.html'));
});

// Registration Route with enhanced debugging
app.post('/register', async (req, res) => {
    console.log('Register request received:', req.body);
    console.log('Session before registration:', req.session);
    try {
        const { name, email, phone, comments, paymentMethod } = req.body;
        if (!name || !email || !phone || !paymentMethod) {
            console.warn('Missing required fields:', { name, email, phone, paymentMethod });
            return res.status(400).json({ error: 'All fields except comments are required' });
        }

        // Create and save the user
        const user = new User({ name, email, phone, comments, paymentMethod });
        const savedUser = await user.save();
        console.log('User saved to database:', savedUser);

        // Set session userId
        req.session.userId = savedUser._id.toString();
        console.log('Session after setting userId:', req.session);

        // Verify session persistence
        req.session.save(err => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ error: 'Failed to save session' });
            }
            console.log('Session saved successfully');
            res.json({ message: 'Registration successful', redirect: '/playin.html' });
        });
    } catch (error) {
        console.error('Error during registration:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
});

// Play-In Routes
app.get('/get-playin', async (req, res) => {
    console.log('Get Play-In request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-playin - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        const responseData = { playin: user.playin || {} };
        console.log('Returning Play-In data:', responseData);
        res.json(responseData);
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
            { playin: req.body.playin },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated Play-In data for user:', user.playin);
        res.json({ message: 'Play-In data saved successfully' });
    } catch (error) {
        console.error('Error saving Play-In data:', error);
        res.status(500).json({ error: 'Server error saving Play-In data' });
    }
});

// First Round East Routes
app.get('/get-firstround-east', async (req, res) => {
    console.log('Get First Round East request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-firstround-east - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { matchup1: '', matchup2: '', matchup3: '', matchup4: '', series1: '', series2: '', series3: '', series4: '' };
        const playinData = user.playin || { east7: '7th Seed', east8: '8th Seed' };
        const responseData = {
            firstRoundEast: user.firstRoundEast ? { ...defaultData, ...user.firstRoundEast } : defaultData,
            playin: { east7: playinData.east7 || '7th Seed', east8: playinData.east8 || '8th Seed' }
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
        console.log('Updated First Round East data for user:', user.firstRoundEast);
        res.json({ message: 'First Round East data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round East data:', error);
        res.status(500).json({ error: 'Server error saving First Round East data' });
    }
});

// First Round West Routes
app.get('/get-firstround-west', async (req, res) => {
    console.log('Get First Round West request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-firstround-west - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { matchup1: '', matchup2: '', matchup3: '', matchup4: '', series1: '', series2: '', series3: '', series4: '' };
        const playinData = user.playin || { west7: '7th Seed', west8: '8th Seed' };
        const responseData = {
            firstRoundWest: user.firstRoundWest ? { ...defaultData, ...user.firstRoundWest } : defaultData,
            playin: { west7: playinData.west7 || '7th Seed', west8: playinData.west8 || '8th Seed' }
        };
        console.log('Returning First Round West data:', responseData);
        res.json(responseData);
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
        console.log('Updated First Round West data for user:', user.firstRoundWest);
        res.json({ message: 'First Round West data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round West data:', error);
        res.status(500).json({ error: 'Server error saving First Round West data' });
    }
});

// Semifinals Routes
app.get('/get-semifinals', async (req, res) => {
    console.log('Get Semifinals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-semifinals - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User data:', user);
        const hasEastData = user.firstRoundEast && Object.keys(user.firstRoundEast).length > 0;
        const hasWestData = user.firstRoundWest && Object.keys(user.firstRoundWest).length > 0;
        if (!hasEastData || !hasWestData) {
            console.warn('First Round East or West not completed for user:', req.session.userId);
            return res.status(400).json({ error: 'Please complete the First Round East and West steps first' });
        }
        const defaultData = { east1: '', east2: '', west1: '', west2: '', eastSeries1: '', eastSeries2: '', westSeries1: '', westSeries2: '' };
        const semifinalsData = user.semifinals ? { ...defaultData, ...user.semifinals } : defaultData;
        const responseData = {
            semifinals: semifinalsData,
            firstRoundEast: user.firstRoundEast || {},
            firstRoundWest: user.firstRoundWest || {}
        };
        console.log('Returning Semifinals data:', responseData);
        res.json(responseData);
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
        console.log('Updated Semifinals data for user:', user.semifinals);
        res.json({ message: 'Semifinals data saved successfully' });
    } catch (error) {
        console.error('Error saving Semifinals data:', error);
        res.status(500).json({ error: 'Server error saving Semifinals data' });
    }
});

// Conference Finals Routes
app.get('/get-conferencefinals', async (req, res) => {
    console.log('Get Conference Finals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-conferencefinals - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User data:', user);
        const hasSemifinalsData = user.semifinals && 
            user.semifinals.east1 && user.semifinals.east2 && 
            user.semifinals.west1 && user.semifinals.west2;
        if (!hasSemifinalsData) {
            console.warn('Semifinals step not completed for user:', req.session.userId);
            return res.status(400).json({ error: 'Please complete the Semifinals step first' });
        }
        const defaultData = { eastWinner: '', westWinner: '', eastSeries: '', westSeries: '' };
        const conferenceFinalsData = user.conferenceFinals ? { ...defaultData, ...user.conferenceFinals } : defaultData;
        const responseData = {
            conferenceFinals: conferenceFinalsData,
            semifinals: user.semifinals || {}
        };
        console.log('Returning Conference Finals data:', responseData);
        res.json(responseData);
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
        console.log('Updated Conference Finals data for user:', user.conferenceFinals);
        res.json({ message: 'Conference Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Conference Finals data:', error);
        res.status(500).json({ error: 'Server error saving Conference Finals data' });
    }
});

// Finals Routes
app.get('/get-finals', async (req, res) => {
    console.log('Get Finals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    console.log('Session Cookie from Request:', req.headers.cookie || 'none');
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-finals - Session not found');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User data:', user);
        const hasConferenceFinalsData = user.conferenceFinals && 
            user.conferenceFinals.eastWinner && user.conferenceFinals.westWinner;
        if (!hasConferenceFinalsData) {
            console.warn('Conference Finals step not completed for user:', req.session.userId);
            return res.status(400).json({ error: 'Please complete the Conference Finals step first' });
        }
        const defaultData = { champion: '', mvp: '', finalScore: '' };
        const finalsData = user.finals ? { ...defaultData, ...user.finals } : defaultData;
        const responseData = {
            finals: finalsData,
            conferenceFinals: user.conferenceFinals || {}
        };
        console.log('Returning Finals data:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching Finals data:', error);
        res.status(500).json({ error: 'Server error fetching Finals data' });
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
        console.log('Updated Finals data for user:', user.finals);
        res.json({ message: 'Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Finals data:', error);
        res.status(500).json({ error: 'Server error saving Finals data' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});