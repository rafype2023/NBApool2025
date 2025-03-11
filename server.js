const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');

const app = express();

// Middleware to force HTTPS in production
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Rely on environment variable only
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nba_pool',
        ttl: 24 * 60 * 60 // 1 day in seconds
    }),
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false, // Temporarily disable secure for debugging
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' in production for fetch requests
        path: '/', // Explicitly set path
        domain: process.env.NODE_ENV === 'production' ? 'nbapool2025.onrender.com' : undefined // Explicitly set domain in production
    }
}));

app.use((req, res, next) => {
    console.log('Session middleware - SessionID:', req.sessionID);
    console.log('Session middleware - Session:', req.session);
    console.log('Request Headers - Cookie:', req.headers.cookie); // Log incoming cookie
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
    firstRoundEast: Object,
    firstRoundWest: Object,
    semifinals: Object,
    conferenceFinals: Object,
    finals: Object
});

const User = mongoose.model('User', userSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'rafyperez@gmail.com',
        pass: process.env.EMAIL_PASS || 'wdtvkhmlfjguyrsb'
    }
});

// Routes

// Serve HTML files from views directory
app.get('/', (req, res) => {
    console.log('Serving index.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/playin.html', (req, res) => {
    console.log('Serving playin.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'playin.html'));
});

app.get('/firstround_east.html', (req, res) => {
    console.log('Serving firstround_east.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'firstround_east.html'));
});

app.get('/firstround_west.html', (req, res) => {
    console.log('Serving firstround_west.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'firstround_west.html'));
});

app.get('/semifinals.html', (req, res) => {
    console.log('Serving semifinals.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'semifinals.html'));
});

app.get('/conferencefinals.html', (req, res) => {
    console.log('Serving conferencefinals.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'conferencefinals.html'));
});

app.get('/finals.html', (req, res) => {
    console.log('Serving finals.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'finals.html'));
});

app.get('/summary.html', (req, res) => {
    console.log('Serving summary.html - Session:', req.session);
    res.sendFile(path.join(__dirname, 'views', 'summary.html'));
});

// Registration Route
app.post('/register', async (req, res) => {
    console.log('Register request:', req.body);
    console.log('Session before registration:', req.session);
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            comments: req.body.comments,
            paymentMethod: req.body.paymentMethod
        });
        await user.save();
        req.session.userId = user._id.toString(); // Ensure userId is a string
        req.session.save(err => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ error: 'Error saving session' });
            }
            console.log('User registered, session updated:', req.session);
            // Log the Set-Cookie header being sent
            const setCookieHeader = res.get('Set-Cookie');
            console.log('Set-Cookie Header in /register response:', setCookieHeader);
            res.json({ message: 'Registration successful', redirect: '/playin.html' });
        });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) { // Duplicate key error (email)
            res.status(400).json({ error: 'Email already registered' });
        } else {
            res.status(500).json({ error: 'Error registering user' });
        }
    }
});

// Play-In Routes
app.get('/get-playin', async (req, res) => {
    console.log('Cookies received:', req.headers.cookie); // Log incoming cookie
    console.log('Get Play-In request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
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
        const responseData = { playin: user.playin || { east7: '', east8: '', west7: '', west8: '' } };
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
            { $set: { playin: req.body.playin || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated Play-In data for user:', user.playin);
        res.json({ message: 'Play-In data saved successfully', redirect: '/firstround_east.html' });
    } catch (error) {
        console.error('Error saving Play-In data:', error);
        res.status(500).json({ error: 'Server error saving Play-In data' });
    }
});

// First Round East Routes
app.get('/get-firstround-east', async (req, res) => {
    console.log('Get First Round East request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { matchup1: '', matchup2: '', matchup3: '', matchup4: '', series1: '', series2: '', series3: '', series4: '' };
        const playinData = user.playin || { east7: '', east8: '' };
        const responseData = {
            firstRoundEast: user.firstRoundEast ? { ...defaultData, ...user.firstRoundEast } : defaultData,
            playin: playinData
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
            { $set: { firstRoundEast: req.body.firstRoundEast || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated First Round East data for user:', user.firstRoundEast);
        res.json({ message: 'First Round East data saved successfully', redirect: '/firstround_west.html' });
    } catch (error) {
        console.error('Error saving First Round East data:', error);
        res.status(500).json({ error: 'Server error saving First Round East data' });
    }
});

// First Round West Routes
app.get('/get-firstround-west', async (req, res) => {
    console.log('Get First Round West request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { matchup1: '', matchup2: '', matchup3: '', matchup4: '', series1: '', series2: '', series3: '', series4: '' };
        const playinData = user.playin || { west7: '', west8: '' };
        const responseData = {
            firstRoundWest: user.firstRoundWest ? { ...defaultData, ...user.firstRoundWest } : defaultData,
            playin: playinData
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
            { $set: { firstRoundWest: req.body.firstRoundWest || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated First Round West data for user:', user.firstRoundWest);
        res.json({ message: 'First Round West data saved successfully', redirect: '/semifinals.html' });
    } catch (error) {
        console.error('Error saving First Round West data:', error);
        res.status(500).json({ error: 'Server error saving First Round West data' });
    }
});

// Semifinals Routes
app.get('/get-semifinals', async (req, res) => {
    console.log('Get Semifinals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { east1: '', east2: '', west1: '', west2: '', eastSeries1: '', eastSeries2: '', westSeries1: '', westSeries2: '' };
        const responseData = {
            semifinals: user.semifinals ? { ...defaultData, ...user.semifinals } : defaultData,
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
            { $set: { semifinals: req.body.semifinals || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated Semifinals data for user:', user.semifinals);
        res.json({ message: 'Semifinals data saved successfully', redirect: '/conferencefinals.html' });
    } catch (error) {
        console.error('Error saving Semifinals data:', error);
        res.status(500).json({ error: 'Server error saving Semifinals data' });
    }
});

// Conference Finals Routes
app.get('/get-conferencefinals', async (req, res) => {
    console.log('Get Conference Finals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { eastWinner: '', westWinner: '', eastSeries: '', westSeries: '' };
        const responseData = {
            conferenceFinals: user.conferenceFinals ? { ...defaultData, ...user.conferenceFinals } : defaultData,
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
            { $set: { conferenceFinals: req.body.conferenceFinals || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated Conference Finals data for user:', user.conferenceFinals);
        res.json({ message: 'Conference Finals data saved successfully', redirect: '/finals.html' });
    } catch (error) {
        console.error('Error saving Conference Finals data:', error);
        res.status(500).json({ error: 'Server error saving Conference Finals data' });
    }
});

// Finals Routes
app.get('/get-finals', async (req, res) => {
    console.log('Get Finals request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaultData = { champion: '', mvp: '', finalScore: '', seriesLength: '' };
        const conferenceFinalsData = user.conferenceFinals || { eastWinner: '', westWinner: '' };
        const responseData = {
            finals: user.finals ? { ...defaultData, ...user.finals } : defaultData,
            conferenceFinals: conferenceFinalsData
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
            { $set: { finals: req.body.finals || {} } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log('Updated Finals data for user:', user.finals);
        res.json({ message: 'Finals data saved successfully', redirect: '/summary.html' });
    } catch (error) {
        console.error('Error saving Finals data:', error);
        res.status(500).json({ error: 'Server error saving Finals data' });
    }
});

// Summary Route
app.get('/get-summary', async (req, res) => {
    console.log('Get Summary request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        const responseData = {
            personalData: {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                comments: user.comments || '',
                paymentMethod: user.paymentMethod || ''
            },
            selections: {
                playin: user.playin || {},
                firstRoundEast: user.firstRoundEast || {},
                firstRoundWest: user.firstRoundWest || {},
                semifinals: user.semifinals || {},
                conferenceFinals: user.conferenceFinals || {},
                finals: user.finals || {}
            }
        };
        console.log('Returning Summary data:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching Summary data:', error);
        res.status(500).json({ error: 'Server error fetching Summary data' });
    }
});

// Start Over Route
app.post('/start-over', async (req, res) => {
    console.log('Start Over request:', { sessionId: req.sessionID, userId: req.session.userId, session: req.session });
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.warn('User not found for ID:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        const mailOptions = {
            from: process.env.EMAIL_USER || 'rafyperez@gmail.com',
            to: user.email,
            subject: 'NBA Pool 2025 - Your Selections Before Starting Over',
            text: `
                Dear ${user.name},

                Here is a summary of your NBA Pool 2025 selections before starting over:

                Personal Information:
                - Name: ${user.name}
                - Email: ${user.email}
                - Phone: ${user.phone}
                - Comments: ${user.comments || 'None'}
                - Payment Method: ${user.paymentMethod}

                Selections:
                - Play-In:
                    - East 7th Seed: ${user.playin?.east7 || 'Not selected'}
                    - East 8th Seed: ${user.playin?.east8 || 'Not selected'}
                    - West 7th Seed: ${user.playin?.west7 || 'Not selected'}
                    - West 8th Seed: ${user.playin?.west8 || 'Not selected'}
                - First Round East:
                    - Matchup 1: ${user.firstRoundEast?.matchup1 || 'Not selected'}, Series: ${user.firstRoundEast?.series1 || 'Not selected'}
                    - Matchup 2: ${user.firstRoundEast?.matchup2 || 'Not selected'}, Series: ${user.firstRoundEast?.series2 || 'Not selected'}
                    - Matchup 3: ${user.firstRoundEast?.matchup3 || 'Not selected'}, Series: ${user.firstRoundEast?.series3 || 'Not selected'}
                    - Matchup 4: ${user.firstRoundEast?.matchup4 || 'Not selected'}, Series: ${user.firstRoundEast?.series4 || 'Not selected'}
                - First Round West:
                    - Matchup 1: ${user.firstRoundWest?.matchup1 || 'Not selected'}, Series: ${user.firstRoundWest?.series1 || 'Not selected'}
                    - Matchup 2: ${user.firstRoundWest?.matchup2 || 'Not selected'}, Series: ${user.firstRoundWest?.series2 || 'Not selected'}
                    - Matchup 3: ${user.firstRoundWest?.matchup3 || 'Not selected'}, Series: ${user.firstRoundWest?.series3 || 'Not selected'}
                    - Matchup 4: ${user.firstRoundWest?.matchup4 || 'Not selected'}, Series: ${user.firstRoundWest?.series4 || 'Not selected'}
                - Semifinals:
                    - East 1: ${user.semifinals?.east1 || 'Not selected'}, Series: ${user.semifinals?.eastSeries1 || 'Not selected'}
                    - East 2: ${user.semifinals?.east2 || 'Not selected'}, Series: ${user.semifinals?.eastSeries2 || 'Not selected'}
                    - West 1: ${user.semifinals?.west1 || 'Not selected'}, Series: ${user.semifinals?.westSeries1 || 'Not selected'}
                    - West 2: ${user.semifinals?.west2 || 'Not selected'}, Series: ${user.semifinals?.westSeries2 || 'Not selected'}
                - Conference Finals:
                    - Eastern Conference: ${user.conferenceFinals?.eastWinner || 'Not selected'}, Series: ${user.conferenceFinals?.eastSeries || 'Not selected'}
                    - Western Conference: ${user.conferenceFinals?.westWinner || 'Not selected'}, Series: ${user.conferenceFinals?.westSeries || 'Not selected'}
                - Finals:
                    - Champion: ${user.finals?.champion || 'Not selected'}
                    - Series Length: ${user.finals?.seriesLength || 'Not selected'}
                    - MVP: ${user.finals?.mvp || 'Not selected'}
                    - Final Score: ${user.finals?.finalScore || 'Not selected'}

                Your selections have been cleared, and you can now start over with a fresh set of predictions.

                Best,
                NBA Pool 2025 Team
            `
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending start-over email:', error);
            } else {
                console.log('Start-over email sent:', info.response);
            }
        });

        // Reset user data (clear all selections, keep personal info)
        user.playin = {};
        user.firstRoundEast = {};
        user.firstRoundWest = {};
        user.semifinals = {};
        user.conferenceFinals = {};
        user.finals = {};
        await user.save();
        console.log('User data reset for:', user.email);

        // Destroy session and redirect
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Server error resetting session' });
            }
            res.json({ message: 'Session reset, starting over', redirect: '/' });
        });
    } catch (error) {
        console.error('Error in start-over:', error);
        res.status(500).json({ error: 'Server error during start-over' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});