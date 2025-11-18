// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// import model (ensure file exists at ./models/Student.js)
const Student = require('./model/Student');

const app = express();

/* -------------------- Config / Middleware -------------------- */

// views + layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // looks for views/layout.ejs

// static files (css/js/images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// method override to support PUT/DELETE from forms (use ?_method=PUT)
app.use(methodOverride('_method'));

/* -------------------- MongoDB Connect -------------------- */

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_marks_ejs';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

/* -------------------- Routes -------------------- */

// Home -> list with optional search (?q=)
app.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let filter = {};
    if (q) {
      // escape special chars and create case-insensitive regex
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter = { $or: [{ name: re }, { roll: re }, { className: re }] };
    }
    const students = await Student.find(filter).sort({ createdAt: -1 }).limit(500);
    res.render('index', { students, q, title: 'All Students' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add form
app.get('/students/add', (req, res) => {
  res.render('form', { student: null, action: '/students', method: 'POST', title: 'Add Student' });
});

// Create
app.post('/students', async (req, res) => {
  try {
    const { name, roll, className, math = 0, science = 0, english = 0 } = req.body;
    const m = {
      math: Number(math) || 0,
      science: Number(science) || 0,
      english: Number(english) || 0
    };
    const total = m.math + m.science + m.english;
    const percent = total === 0 ? 0 : parseFloat((total / 3).toFixed(2));
    const student = new Student({ name, roll, className, marks: m, total, percent });
    await student.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit form
app.get('/students/:id/edit', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect('/');
    res.render('form', { student, action: `/students/${student._id}?_method=PUT`, method: 'POST', title: 'Edit Student' });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Update
app.put('/students/:id', async (req, res) => {
  try {
    const { name, roll, className, math = 0, science = 0, english = 0 } = req.body;
    const m = {
      math: Number(math) || 0,
      science: Number(science) || 0,
      english: Number(english) || 0
    };
    const total = m.math + m.science + m.english;
    const percent = total === 0 ? 0 : parseFloat((total / 3).toFixed(2));
    await Student.findByIdAndUpdate(req.params.id, { name, roll, className, marks: m, total, percent }, { new: true });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete (POST form with method-override)
app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// optional direct GET delete (if you prefer link-based deletion)
app.get('/students/:id/delete', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

/* -------------------- Start server -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
