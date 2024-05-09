const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require("../common/constants");

let userSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: "",
    trim: true,
    lowercase: true,
    index: true
  },
  phoneNo: {
    type: String,
    default: "",
    index: true
  },
  dialCode: {
    type: String,
    default: "",
    index: true
  },
  gender: {
    type: String,
    enum: Object.values(constants.GENDER)
  },
  image: {
    type: String,
    default: ""
  },
  dateOfBirth: {
    type: Date,
    default: ""
  },
  lang: {
    type: String,
    default: ""
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  jti: {
    type: String,
    default: "",
    select: false,
    index: true
  },
  deviceType: {
    type: String,
    enum: Object.values(constants.DEVICETYPE)
  },
  deviceToken: {
    type: String,
    default: "",
    index: true
  },
  loginCount: {
    type: Number,
    default: 0
  },
  password: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);