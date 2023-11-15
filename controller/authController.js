const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

//const users = require('./users');

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
};

const login = (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
//  const user = users.find(u => u.username === username);
const user = {  username:'omar',
                id:1,
                password:"Avapass123"
            }
  // If the user is not found or the password is incorrect, respond with an error
  if(username !== user.username || password !== user.password) {
  //if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // If authentication is successful, generate a JWT and send it in the response
  const token = generateToken(user);
  res.json({ token });
};

module.exports = { login };
