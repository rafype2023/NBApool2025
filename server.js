const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nbapool')
  .then(() => {
      console.log('Connected to MongoDB');
  })
  .catch(err => {
      console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files from 'public' directory
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - Session ID: ${req.sessionID}, UserId: ${req.session.userId}`);
    next();
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    comments: { type: String },
    paymentMethod: { type: String, required: true },
    playin: { type: Object, default: {} },
    firstRoundEast: { type: Object, default: {} },
    firstRoundWest: { type: Object, default: {} },
    semifinals: { type: Object, default: {} },
    conferenceFinals: { type: Object, default: {} },
    finals: { type: Object, default: {} },
    summary: { type: Object, default: {} }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/submit-registration', async (req, res) => {
    try {
        const { name, email, phone, comments, paymentMethod } = req.body;

        if (!name || !email || !phone || !paymentMethod) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({
            name,
            email,
            phone,
            comments,
            paymentMethod,
            playin: {},
            firstRoundEast: {},
            firstRoundWest: {},
            semifinals: {},
            conferenceFinals: {},
            finals: {},
            summary: {}
        });

        await user.save();
        req.session.userId = user._id;
        console.log(`User saved with ID: ${user._id}`);
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
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

app.get('/get-playin', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(req.session.userId);
        if (!user || !user.playin) {
            return res.json({ east7: '', east8: '', west7: '', west8: '' });
        }

        res.json(user.playin);
    } catch (error) {
        console.error('Error fetching Play-In data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/get-all-picks', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const picks = {
            playin: user.playin || {},
            firstRoundEast: user.firstRoundEast || {},
            firstRoundWest: user.firstRoundWest || {},
            semifinals: user.semifinals || {},
            conferenceFinals: user.conferenceFinals || {},
            finals: user.finals || {}
        };

        res.json(picks);
    } catch (error) {
        console.error('Error fetching all picks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-playin', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { east7, east8, west7, west8 } = req.body;
        const playinData = { east7, east8, west7, west8 };

        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { playin: playinData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`Play-In saved for userId: ${req.session.userId}`);
        res.json({ message: 'Play-In data saved successfully' });
    } catch (error) {
        console.error('Error saving Play-In data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-firstround-east', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { firstRoundEast } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { firstRoundEast: firstRoundEast },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`First Round East saved for userId: ${req.session.userId}`);
        res.json({ message: 'First Round East data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round East data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-firstround-west', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { firstRoundWest } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { firstRoundWest: firstRoundWest },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`First Round West saved for userId: ${req.session.userId}`);
        res.json({ message: 'First Round West data saved successfully' });
    } catch (error) {
        console.error('Error saving First Round West data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-semifinals', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { semifinals } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { semifinals: semifinals },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`Semifinals saved for userId: ${req.session.userId}`);
        res.json({ message: 'Semifinals data saved successfully' });
    } catch (error) {
        console.error('Error saving Semifinals data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-conferencefinals', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { conferenceFinals } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { conferenceFinals: conferenceFinals },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`Conference Finals saved for userId: ${req.session.userId}`);
        res.json({ message: 'Conference Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Conference Finals data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/submit-finals', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { finals } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { finals: finals },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`Finals saved for userId: ${req.session.userId}`);
        res.json({ message: 'Finals data saved successfully' });
    } catch (error) {
        console.error('Error saving Finals data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});