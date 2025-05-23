const User = require('../models/User');  // << This is required!

const searchUsers = async (req, res) => {
  const { search } = req.body;

  console.log('Search term:', search);

  if (!search) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }).select('-password');

    console.log('Users found:', users);
    res.json(users);
  } catch (err) {
    console.error('Error searching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchUsers,
};
