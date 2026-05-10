const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function hashPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vibestage');
    console.log('Connected to MongoDB...');

    const User = mongoose.model('User', new mongoose.Schema({
      password: { type: String }
    }, { strict: false }));

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    let updatedCount = 0;

    for (const user of users) {
      // Bcrypt hashes always start with $2
      if (user.password && !user.password.startsWith('$2')) {
        console.log(`Hashing password for: ${user.email || user._id}`);
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        updatedCount++;
      }
    }

    console.log(`\\nSuccessfully hashed ${updatedCount} passwords.`);
    process.exit(0);
  } catch (e) {
    console.error('Error hashing passwords:', e);
    process.exit(1);
  }
}

hashPasswords();
