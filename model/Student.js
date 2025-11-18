const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  math: { type: Number, required: true,default:0 },
  science: { type: Number, required: true,default:0 },
  english: { type: Number, required: true,default:0 }
},{_id : false});

const studentSchema = new mongoose.Schema({ 
  name: { type: String, required: true, trim: true },
  roll: { type: String, required: true, trim: true, index: true },
  className: { type: String, default: '' },
  marks: { type: MarksSchema, default: () => ({}) },
  total: { type: Number, default: 0 },
  percent: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);