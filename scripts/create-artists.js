const mongoose = require('mongoose');

async function createArtistProfiles() {
  await mongoose.connect('mongodb://localhost:27017/vibestage');
  
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String
  }, { strict: false }));
  
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
  }, { strict: false }));
  
  // Find users with artist role
  const artistUsers = await User.find({ role: 'artist' });
  console.log('Artist users found:', artistUsers.length);
  
  const genres = ['Electronic / EDM', 'Indie Pop', 'Rock / Blues', 'R&B / Soul', 'House / Techno', 'Folk / Acoustic'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Goa', 'Jaipur'];
  const images = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop'
  ];
  
  for (let i = 0; i < artistUsers.length; i++) {
    const user = artistUsers[i];
    
    // Check if artist profile exists
    const existing = await Artist.findOne({ email: user.email });
    if (existing) {
      console.log('Artist already exists:', user.name);
      continue;
    }
    
    const genre = genres[i % genres.length];
    const location = locations[i % locations.length];
    const image = images[i % images.length];
    const price = [25000, 18000, 35000, 22000, 30000, 15000][i % 6];
    
    await Artist.create({
      userId: user._id,
      name: user.name,
      genre,
      location,
      price,
      image,
      rating: 4.5 + Math.random() * 0.5,
      email: user.email,
      bio: `Professional ${genre} artist with years of experience performing at events and venues.`,
      phone: "",
      languages: ['English', 'Hindi'],
      socialLinks: { instagram: "", youtube: "", website: "" },
      availableDates: [],
      isAvailable: true
    });
    
    console.log('Created artist profile:', user.name, '-', genre, '-', location, '- ₹' + price);
  }
  
  const totalArtists = await Artist.countDocuments();
  console.log('\\nTotal artists in DB:', totalArtists);
  
  process.exit(0);
}

createArtistProfiles().catch(e => { console.error(e); process.exit(1); });