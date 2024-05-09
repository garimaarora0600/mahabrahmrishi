const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const constants = require("../common/constants");
const AdminSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: "",
        lowercase: true,
        index: true
    },
    phoneNo: {
        type: String,
        default: "",
        index: true
    },
    username: {
        type: String,
        default: ""
    },
    role: {
        type: Number,
        enum: [constants.ROLE.ADMIN, constants.ROLE.SUBADMIN],
        default: constants.ROLE.SUBADMIN
    },
    dialCode: {
        type: String,
        default: "",
        index: true
    },
    password: {
        type: String,
        default: "",
        index: true
    },
    image: {
        type: String,
        default: ""
    },
    loginCount: {
        type: Number,
        default: 0
    },
    jti: {
        type: String,
        default: "",
        index: true
    },
    DOB: {
        type: Date,
        default: ""
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
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deviceType: {
        type: String,
        enum: Object.values(constants.DEVICETYPE),
        default: constants.DEVICETYPE.IOS
    },
    deviceToken: {
        type: String,
        default: "",
        index: true
    },
    permission: [{
        label: {
          type: String,
          default: null
        },
        isView: {
          type: Boolean,
          default: false
        },
        isAdd: {
          type: Boolean,
          default: false
        },
        isEdit: {
          type: Boolean,
          default: false
        },
        sideBarId: {
          type: Number,
          default: ""
        },
        isDelete: {
          type: Boolean,
          default: false
        }
      }]
}, {
    timestamps: true
});
AdminSchema.set("toJSON", {
    virtuals: true
});
module.exports = mongoose.model('Admin', AdminSchema);