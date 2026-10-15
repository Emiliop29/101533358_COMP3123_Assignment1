
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');



const {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');


// All employee routes require JWT
router.use(authMiddleware);

router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.get('/employees/:eid', getEmployeeById);
router.put('/employees/:eid', updateEmployee);
router.delete('/employees', deleteEmployee);



module.exports = router;
