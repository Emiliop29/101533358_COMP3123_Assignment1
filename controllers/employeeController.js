
const mongoose = require('mongoose');
const Employee = require('../models/employee');

// GET all employees belonging to logged-in user
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      user: req.user._id
    }).sort({ created_at: -1 });

    return res.status(200).json({
      message: 'Employees retrieved successfully',
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// POST create employee
const createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department
    } = req.body;

    const validString = (value, max = 100) =>
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.trim().length <= max;

    if (
      !validString(first_name, 50) ||
      !validString(last_name, 50) ||
      !validString(email, 254) ||
      !validString(position) ||
      !validString(department)
    ) {
      return res.status(400).json({
        message: 'Missing or invalid employee fields'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Invalid employee email'
      });
    }

    if (
      typeof salary !== 'number' ||
      !Number.isFinite(salary) ||
      salary <= 0
    ) {
      return res.status(400).json({
        message: 'Salary must be a positive number'
      });
    }

    const joiningDate = new Date(date_of_joining);

    if (
      typeof date_of_joining !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date_of_joining) ||
      Number.isNaN(joiningDate.getTime()) ||
      joiningDate.toISOString().slice(0, 10) !== date_of_joining
    ) {
      return res.status(400).json({
        message: 'Invalid date of joining. Use YYYY-MM-DD'
      });
    }

    const employee = await Employee.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      position: position.trim(),
      salary,
      date_of_joining: joiningDate,
      department: department.trim(),
      user: req.user._id
    });

    return res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// GET employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isObjectIdOrHexString(eid)) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    const employee = await Employee.findOne({
      _id: eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error.message);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isObjectIdOrHexString(eid)) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'position',
      'salary',
      'date_of_joining',
      'department'
    ];

    const updates = req.body;

    if (
      !updates ||
      typeof updates !== 'object' ||
      Array.isArray(updates) ||
      Object.keys(updates).length === 0 ||
      Object.keys(updates).some(
        field => !allowedFields.includes(field)
      )
    ) {
      return res.status(400).json({
        message: 'Invalid update fields'
      });
    }

    const stringFields = [
      'first_name',
      'last_name',
      'email',
      'position',
      'department'
    ];

    for (const field of stringFields) {
      if (field in updates) {
        const maxLength = field === 'email' ? 254 :
          ['first_name', 'last_name'].includes(field) ? 50 : 100;

        if (
          typeof updates[field] !== 'string' ||
          !updates[field].trim() ||
          updates[field].trim().length > maxLength
        ) {
          return res.status(400).json({
            message: `Invalid ${field}`
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (
      'email' in updates &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
    ) {
      return res.status(400).json({
        message: 'Invalid employee email'
      });
    }

    if ('email' in updates) {
      updates.email = updates.email.toLowerCase();
    }

    if (
      'salary' in updates &&
      (typeof updates.salary !== 'number' ||
       !Number.isFinite(updates.salary) ||
       updates.salary <= 0)
    ) {
      return res.status(400).json({
        message: 'Salary must be positive'
      });
    }

    if ('date_of_joining' in updates) {
      const value = updates.date_of_joining;
      const date = new Date(value);

      if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return res.status(400).json({
          message: 'Invalid date of joining'
        });
      }

      updates.date_of_joining = date;
    }

    const employee = await Employee.findOneAndUpdate(
      {
        _id: eid,
        user: req.user._id
      },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    console.error('Update employee error:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


const deleteEmployee = async (req, res) => {
  try {
    const { eid } = req.query;

    // Validate employee ID
    if (
      typeof eid !== 'string' ||
      !mongoose.isObjectIdOrHexString(eid)
    ) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    // Delete only an employee owned by this user
    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // 204 must not return a response body
    return res.status(204).send();

  } catch (error) {
    console.error('Delete employee error:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};


