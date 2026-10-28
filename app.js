const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const employeeRouter = express.Router();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    avatarColor: { type: String, trim: true, default: '#2F4858' },
  },
  { timestamps: true }
);

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

employeeRouter.get('/', async (_req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

employeeRouter.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
});

employeeRouter.post('/', async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
});

employeeRouter.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
});

employeeRouter.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(['/api/employees', '/employees'], employeeRouter);

const frontendDirectories = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'build'),
];

const frontendDirectory = frontendDirectories.find((directory) => fs.existsSync(directory));
if (frontendDirectory) {
  app.use(express.static(frontendDirectory));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDirectory, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid employee data', details: error.message });
  }

  res.status(500).json({ message: 'Server error' });
});

module.exports = { app, Employee };
