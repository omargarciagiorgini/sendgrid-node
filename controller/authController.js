const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
};

const login = (req, res) => {
  const { username, password } = req.body;

  const user = {  username:process.env.USER_LOGIN,
                id:1,
                password:process.env.PASSWORD_LOGIN
            }
  if(username !== user.username || password !== user.password) {

    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = generateToken(user);
  res.json({ token });
};

module.exports = { login };
