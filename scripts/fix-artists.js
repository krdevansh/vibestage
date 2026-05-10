const mongoose = require('mongoose');

async function fixArtists() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibestage');
  
  const Artist = mongoose.model('Artist', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    genre: String,
    price: Number,
    image: String,
    rating: Number,
    location: String,
    bio: String,
    email: String,
    phone: String,
    languages: [String],
    socialLinks: mongoose.Schema.Types.Mixed,
    availableDates: [Date],
    isAvailable: Boolean
  }));
  
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String
  }));
  
  // Get artists without userId or with null userId
  const artists = await Artist.find({ $or: [{ userId: null }, { userId: { $exists: false } }] });
  
  console.log('Artists without userId:', artists.length);
  
  for (const artist of artists) {
    // Find matching user by email
    const user = await User.findOne({ email: artist.email, role: 'artist' });
    if (user) {
      await Artist.findByIdAndUpdate(artist._id, { userId: user._id });
      console.log('Fixed:', artist.name, '->', user.email);
    } else {
      console.log('No artist user found for:', artist.email);
    }
  }
  
  // Count artists with userId
  const fixedCount = await Artist.countDocuments({ userId: { $exists: true, $ne: null } });
  console.log('Total artists with userId:', fixedCount);
  
  process.exit(0);
}
fixArtists().catch(e => { console.error(e); process.exit(1); });