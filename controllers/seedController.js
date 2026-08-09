const Seed = require('../models/Seed');

const createListing = async (req, res) => {
  try {
    const { userId, plantType, quantity, price, description } = req.body;
    
    const listing = new Seed({
      userId,
      plantType,
      quantity,
      price,
      description,
      status: 'available'
    });
    
    await listing.save();
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getListings = async (req, res) => {
  try {
    const listings = await Seed.find({ status: 'available' })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createListing, getListings };
