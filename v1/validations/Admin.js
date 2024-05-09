const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.identify = Joi.object({
    id: Joi.objectId().required()
});

module.exports.signup = Joi.object({
    email: Joi.string().email().required().error(new Error("Please Enter a valid email")),
    password: Joi.string().required(),
    firstName: Joi.string().optional(),
    lastName:Joi.string().optional(),
    dialCode: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    address: Joi.string().optional(),
    image: Joi.string().optional()
});
module.exports.addSubAdmin = Joi.object({
    email: Joi.string().required(),
    phoneNo: Joi.string().required(),
    dialCode: Joi.string().required(),
    name: Joi.string().required(),
    image: Joi.string().required(),
    permission: Joi.array({
        label: Joi.string().optional(),
        isView: Joi.boolean().optional(),
        isAdd: Joi.boolean().optional(),
        isEdit: Joi.boolean().optional(),
        sideBarId: Joi.number().optional(),
        isDelete: Joi.boolean().optional()
    }).required()
});
module.exports.login=Joi.object({
    email: Joi.string().email().required().error(new Error("Please Enter a valid email")),
    password: Joi.string().required()
});

module.exports.updateProfile=Joi.object({
    email: Joi.string().email().optional().error(new Error("Please Enter a valid email")),
    phoneNo: Joi.string().optional(),
    dialCode: Joi.string().optional(),
    name: Joi.string().optional(),
    username:Joi.string().optional(),
    image: Joi.string().optional(),
    isBlocked: Joi.boolean().optional(),
    isDeleted: Joi.boolean().optional()
});
module.exports.changePassword=Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
});

module.exports.forgotPassword=Joi.object({
    email:Joi.string().email().required().error(new Error("Please Enter a valid email"))
});
module.exports.verifyOtp=Joi.object({
    email:Joi.string().email().required().error(new Error("Please Enter a valid email")),
    otp:Joi.string().required()
});
module.exports.resetPassword=Joi.object({
    newPassword:Joi.string().required()
});
module.exports.addUser = Joi.object({
    phoneNo: Joi.string().required(),
    dialCode: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    email: Joi.string().email().required().error(new Error("Please Enter a valid email")),
    name: Joi.string().required(),
    password:Joi.string().required(),
    username: Joi.string().required(),
    gender: Joi.string().required(),
    image: Joi.string().optional()
});


module.exports.editUser = Joi.object({
    phoneNo: Joi.string().optional(),
    dialCode: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    email: Joi.string().email().optional().error(new Error("Please Enter a valid email")),
    name: Joi.string().optional(),
    password:Joi.string().optional(),
    username: Joi.string().optional(),
    gender: Joi.string().optional(),
    image: Joi.string().optional()
});