const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/nbapool';
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS Configuration
app.use(cors({
    origin: 'https://nbapool2025.onrender.com',
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secure-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 24 * 60 * 60, // 24 hours
        autoRemove: 'native',
        autoRemoveInterval: 10
    }, (err) => {
        if (err) console.error('MongoStore error:', err);
        else console.log('MongoStore initialized');
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Session: ${req.sessionID}, UserId: ${req.session.userId}, Cookie: ${req.headers.cookie || 'none'}`);
    next();
});

// User Schema (Simplified for Example)
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
            if (err) console.error('Session save error:', err);
            else console.log('Session saved with UserId:', req.session.userId);
        });
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.get('/get-playin', async (req, res) => {
    console.log('Get Play-In request:', { sessionId: req.sessionID, userId: req.session.userId });
    if (!req.session.userId) {
        console.warn('Unauthorized access to /get-playin');
        return res.status(401).json({ error: 'Unauthorized: Please register first' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user || !user.playin) {
            return res.json({ east7: '', east8: '', west7: '', west8: '' });
        }
        res.json(user.playin);
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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));