const express = require('express');
const { body, param, validationResult } = require('express-validator');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

//create user list
let users_list = [];

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'Users API along with Validation, Sanitization, and Swagger Documentation',
    },
    servers: [{ url: 'http://159.223.176.225:3000' }],
  },
  apis: ['./server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User is created
 */
app.post(
  '/users',
  [
    body('name').trim().notEmpty().withMessage('Name is required'), // For performing validation and sanitation job
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const newUser = { id: users_list.length + 1, name, email };
    users_list.push(newUser);
    res.status(201).json(newUser);
  }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: The requested user is found
 *       404:
 *         description: User not found
 */
app.get('/users/:id', (req, res) => {
  const user = users_list.find(u => u.id == req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User is not found' });
  }
  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User is updated
 *       400:
 *         description: Validation errors
 *       404:
 *         description: User is not found
 */
app.put(
  '/users/:id',
  [
    param('id').isInt().withMessage('ID should be an integer'),
    body('name').trim().notEmpty().withMessage('Name is mandatory'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = users_list.find(u => u.id == req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }

    user.name = req.body.name;
    user.email = req.body.email;
    res.json(user);
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User is deleted
 *       404:
 *         description: User is not found
 */
app.delete('/users/:id', (req, res) => {
  const userIndex = users_list.findIndex(u => u.id == req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User is not found' });
  }

  users_list.splice(userIndex, 1);
  res.json({ message: 'User is deleted' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://159.223.176.225:${PORT}/docs`));

