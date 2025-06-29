import User from '../models/User.js';

export const searchUsers = async (req, res) => {
  const { search } = req.body;

  if (!search) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }).select('fullName username profilePhoto email mobile'); // <-- include profilePhoto

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { fullName, email, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, profilePhoto },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-__v');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
