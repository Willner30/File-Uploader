// authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let users = [];  // Simulated user database

// Register user
exports.registerUser = async (req, res) => {
    try {
        const { name, phone, email, username, password } = req.body;
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = { name, phone, email, username, password: hashedPassword };
        users.push(newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña inválida' });
        }
        // Generate a token
        const token = jwt.sign(
            { userId: user.username },  // Using username as the user ID for simplicity
            process.env.JWT_SECRET,    // Secret key for signing the token
            { expiresIn: '24h' }       // Token expires in 24 hours
        );
        res.status(200).json({ message: 'Inicio de sesión exitoso', token: token }); // Send the token to the client
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
