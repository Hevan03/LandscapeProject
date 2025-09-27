// machineryModel.js
import mongoose from 'mongoose';

const machinerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rentalPricePerDay: {
    type: Number,
    required: [true, 'Rental price per day is required'],
    min: [0, 'Rental price cannot be negative']
  },
  defaultDurationDays: {
    type: Number,
    default: 1,
    min: [1, 'Default duration must be at least 1 day']
  },
  penaltyPerDay: {
    type: Number,
    default: 0,
    min: [0, 'Penalty cannot be negative']
  },
  imageUrl: {
    type: [String], // Changed to an array of strings
    default: []
  },
  quantity: {
    type: Number,
    default: 1,
    min: [0, 'Quantity cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Machinery = mongoose.model('Machinery', machinerySchema);

export default Machinery;