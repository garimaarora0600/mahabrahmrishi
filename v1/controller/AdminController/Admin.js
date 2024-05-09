const Model = require("../../../models/index");
const Validation = require("../../validations");
const Auth = require("../../../common/authenticate");
const constants = require("../../../common/constants");
const functions = require("../../../common/functions");
const services = require("../../../services");
const mongoose=require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports.signup = async (req, res, next) => {
    try {
        await Validation.Admin.signup.validateAsync(req.body);
        if (req.body.email) {
            const checkEmail = await Model.Admin.findOne({
                email: (req.body.email).toLowerCase(),
                isDeleted: false
            });
            if (checkEmail) throw new Error(constants.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        req.body.role = constants.ROLE.ADMIN;
        req.body.password = await functions.hashPasswordUsingBcrypt(req.body.password);
        req.body.isEmailVerified=true;
        let create = await Model.Admin.create(req.body);
        create = JSON.parse(JSON.stringify(create));
        delete create.password;
        return res.success(constants.MESSAGES.PROFILE_CREATED_SUCCESSFULLY, create);
    } catch (error) {
        next(error);
    }
};

module.exports.login = async (req, res, next) => {
    try {
        await Validation.Admin.login.validateAsync(req.body);
        if (req.body.email) {
            let check = await Model.Admin.findOne({
                email: (req.body.email).toLowerCase(),
                isDeleted: false
            });
            if (!check) throw new Error(constants.MESSAGES.INVALID_DETAILS);
            let matchPwd = await functions.comparePasswordUsingBcrypt(
                req.body.password,
                check.password
            );
            if (!matchPwd) throw new Error(constants.MESSAGES.PASSWORD_DOESNT_MATCH);
            check.loginCount += 1;
            check.jti = functions.generateRandomStringAndNumbers(25);
            await check.save();
            check = JSON.parse(JSON.stringify(check));
            check.accessToken = await Auth.getToken({
                _id: check._id,
                jti: check.jti,
                role: "admin"
            });
            delete check.password;
            return res.success(constants.MESSAGES.LOGIN_SUCCESS, check);
        }
    } catch (error) {
        next(error);
    }
};

module.exports.logout = async (req, res, next) => {
    try {
        console.log("req.admin ", req.admin);
        await Model.Admin.findOneAndUpdate({
            _id: req.admin._id,
            isDeleted: false
        }, {
            $set: {
                deviceType: "",
                deviceToken: "",
                jti: ""
            }
        });
        return res.success(constants.MESSAGES.LOGOUT_SUCCESS, {});
    } catch (error) {
        next(error);
    }
};

module.exports.getProfile = async (req, res, next) => {
    try {
        let check = await Model.Admin.findOne({
            _id: req.admin._id,
            isDeleted: false
        });
        if (!check) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
        return res.success(constants.MESSAGES.PROFILE_FOUND, check);
    } catch (error) {
        next(error);
    }
};

module.exports.updateProfile = async (req, res, next) => {
    try {
        await Validation.Admin.updateProfile.validateAsync(req.body);
        if (req.body.email) {
            let checkEmail = await Model.Admin.findOne({
                _id: {
                    $nin: [req.admin._id]
                },
                email: (req.body.email).toLowerCase(),
                isDeleted: false
            });
            if (checkEmail) throw new Error(constants.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (req.body.phoneNo) {
            let checkPhoneNo = await Model.Admin.findOne({
                _id: {
                    $nin: [req.admin._id]
                },
                phoneNo: req.body.phoneNo,
                isDeleted: false
            });
            if (checkPhoneNo) throw new Error(constants.MESSAGES.PHONE_ALREADY_EXISTS);
        }
        let updatee = await Model.Admin.findByIdAndUpdate({
            _id: req.admin._id,
            isDeleted: false
        }, {
            $set: req.body
        },{
            new:true
        });
        updatee = JSON.parse(JSON.stringify(updatee));
        delete updatee.password;
        return res.success(constants.MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, updatee);
    } catch (error) {
        next(error);
    }
};

module.exports.changePassword = async (req, res, next) => {
    try {
        await Validation.Admin.changePassword.validateAsync(req.body);
        if (req.body.oldPassword == req.body.newPassword) throw new Error(constants.MESSAGES.PASSWORD_SHOULD_BE_DIFF);
        let check = await Model.Admin.findOne({
            _id: req.admin._id,
            isDeleted: false
        });
        if (!check) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
        let matchPwd = await functions.comparePasswordUsingBcrypt(
            req.body.oldPassword,
            check.password
        );
        if (!matchPwd) throw new Error(constants.MESSAGES.PASSWORD_DOESNT_MATCH);
        check.password = await functions.hashPasswordUsingBcrypt(req.body.newPassword);
        await check.save();
        return res.success(constants.MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY, {});
    } catch (error) {
        next(error);
    }
};

module.exports.forgotPassword = async (req, res, next) => {
    try {
        await Validation.Admin.forgotPassword.validateAsync(req.body);
        let check = await Model.Admin.findOne({
            email: (req.body.email).toLowerCase(),
            isDeleted: false
        });
        if (!check) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
        // send otp
        let payload = {
            firstName: check.firstName ? check.firstName : check.email,
            email: check.email,
            otp: functions.generateRandomNumbers(4)
        };
        await services.EmailService.sendEmailVerification(payload);
        return res.success(constants.MESSAGES.OTP_SENT, {});
    } catch (error) {
        next(error);
    }
};

module.exports.verifyOtp = async (req, res, next) => {
    try {
        await Validation.Admin.verifyOtp.validateAsync(req.body);
        let check = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted: false
        });
        if (!check) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
        let checkOtp = await Model.Otp.findOne({
            email: (req.body.email).toLowerCase(),
            otp: req.body.otp
        });
        console.log("checkOtp", checkOtp);
        if (!checkOtp) throw new Error(constants.MESSAGES.OTP_INVALID);
        let jti = functions.generateRandomStringAndNumbers(25);
        await Model.Admin.updateOne({
            _id: check._id
        }, {
            $set: {
                jti: jti,
                isEmailVerified: true
            }
        });
        check = JSON.parse(JSON.stringify(check));
        check.accessToken = Auth.getToken({
            _id: check._id,
            jti: jti,
            role: "admin"
        });
        delete check.password;
        return res.success(constants.MESSAGES.VERIFICATION_SUCCESS, check);
    } catch (error) {
        next(error);
    }
};

module.exports.resetPassword = async (req, res, next) => {
    try {
        await Validation.Admin.resetPassword.validateAsync(req.body);
        let check = await Model.Admin.findOne({
            _id: req.admin._id,
            isDeleted: false
        });
        if (!check) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
        let matchPwd = await functions.comparePasswordUsingBcrypt(req.body.newPassword, check.password);
        if (matchPwd) throw new Error(constants.MESSAGES.PASSWORD_SHOULD_BE_DIFF);
        check.password = await functions.hashPasswordUsingBcrypt(req.body.newPassword);
        await check.save();
        return res.success(constants.MESSAGES.RESET_PWD_SUCCESS, {});
    } catch (error) {
        next(error);
    }
};

module.exports.addUser = async (req, res, next) => {
    try {
        await Validation.Admin.addUser.validateAsync(req.body);
        if (req.body.email) {
            let checkEmail = await Model.User.findOne({
                email: (req.body.email).toLowerCase(),
                isDeleted: false
            });
            if (checkEmail) throw new Error(constants.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (req.body.phoneNo) {
            let checkPhone = await Model.User.findOne({
                phoneNo: req.body.phoneNo,
                dialCode: req.body.dialCode,
                isDeleted: false
            });
            if (checkPhone) throw new Error(constants.MESSAGES.PHONE_ALREADY_EXISTS);
        }
        if (req.body.username) {
            let checkUsername = await Model.User.findOne({
                username: (req.body.username).toLowerCase(),
                isDeleted: false
            });
            if (checkUsername) throw new Error(constants.USERNAME_ALREADY_EXISTS);
        }
        req.body.password = await functions.hashPasswordUsingBcrypt(req.body.password);
        let create = await Model.User.create(req.body);
        return res.success(constants.MESSAGES.USER_ADDED_SUCCESSFUL, create);
    } catch (error) {
        next(error);
    }
};
module.exports.editUser = async (req, res, next) => {
    try {
        await Validation.Admin.editUser.validateAsync(req.body);
        let userId = ObjectId(req.params.id);
        let checkUser = await Model.User.findOne({
            _id: userId,
            isDeleted: false
        }, {
            password: 0
        });
        if (!checkUser) throw new Error(constants.MESSAGES.USER_NOT_FOUND);
        if (req.body.email) {
            let checkEmail = await Model.User.findOne({
                _id: {
                    $ne: userId
                },
                email: (req.body.email).toLowerCase(),
                isDeleted: false
            });
            if (checkEmail) throw new Error(constants.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (req.body.phoneNo) {
            let checkPhone = await Model.User.findOne({
                _id: {
                    $ne: userId
                },
                phoneNo: req.body.phoneNo,
                dialCode: req.body.dialCode,
                isDeleted: false
            });
            if (checkPhone) throw new Error(constants.MESSAGES.PHONE_ALREADY_EXISTS);
        }
        if (req.body.username) {
            let checkUsername = await Model.User.findOne({
                _id: {
                    $ne: userId
                },
                username: (req.body.username).toLowerCase(),
                isDeleted: false
            });
            if (checkUsername) throw new Error(constants.USERNAME_ALREADY_EXISTS);
        }
        let update = await Model.User.findByIdAndUpdate({
            _id: userId
        }, {
            $set: req.body
        },{
            new:true
        });
        return res.success(constants.MESSAGES.USER_UPDATED_SUCCESSFUL, update);
    } catch (error) {
        next(error);
    }
};
module.exports.getUser = async (req, res, next) => {
    try {
        let id = req.params.id;
        let page = null;
        let limit = null;
        page = req.query.page ? Number(req.query.page) : 1;
        limit = req.query.limit ? Number(req.query.limit) : 10;
        let skip = Number((page - 1) * limit);
        if (id == null) {
            let qry = {};
            if (req.query.search) {
                const regex = new RegExp(req.query.search, "i");
                qry._search = regex;
            }
            let pipeline = [];
            pipeline.push({
                $match: {
                    isDeleted: false
                }
            }, {
                $addFields: {
                    _search: {
                        $concat: ["$name", "$username", "$email", "$phoneNo"]
                    }
                }
            }, {
                $match: qry
            }, {
                $sort: {
                    createdAt: -1
                }
            }, {
                $skip: skip
            }, {
                $limit: limit
            });
            let users = await Model.User.aggregate(pipeline);
            pipeline = pipeline.splice(0, pipeline.length - 3);
            let userCount = await Model.User.aggregate(pipeline);
            userCount = userCount.length;
            return res.success(constants.MESSAGES.DATA_FETCHED, {
                users,
                userCount
            });
        }else{
            let users=await Model.User.findOne({
                _id:ObjectId(id),
                isDeleted:false
            });
            return res.success(constants.MESSAGES.DATA_FETCHED,users);
        }
    } catch (error) {
        next(error);
    }
};
module.exports.deleteUser=async(req,res,next)=>{
    try{
        let userId = ObjectId(req.params.id);
        let checkUser = await Model.User.findOne({
            _id: userId,
            isDeleted: false
        }, {
            password: 0
        });
        if (!checkUser) throw new Error(constants.MESSAGES.USER_NOT_FOUND);
        await Model.User.findOneAndUpdate({
            _id: userId,
            isDeleted: false
        },{
            $set:{
                isDeleted:true
            }
        });
        return res.success(constants.MESSAGES.USER_DELETED_SUCCESSFULLY,{});
    }catch(error){
        next(error);
    }
};
module.exports.addSubAdmin = async (req, res, next) => {
    try {
        await Validation.Admin.addSubAdmin.validateAsync(req.body);
        let qry = {
            isDeleted: false
        };
        let or = [];
        if (req.body.email) {
            or.push({
                email: req.body.email.toLowerCase()
            });
        }
        if (req.body.phoneNo) {
            or.push({
                phoneNo: req.body.phoneNo,
                dialCode: req.body.dialCode
            });
        }
        qry.$or = or;
        if (or.length > 0) {
            let admin = await Model.Admin.findOne(qry, {
                email: 1,
                phoneNo: 1
            });

            if (admin) {
                if (admin.email) {
                    if (admin.email == req.body.email.toLowerCase()) {
                        throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
                    }
                }
                if (admin.phoneNo) {
                    if (admin.phoneNo == req.body.phoneNo) {
                        throw new Error(constants.MESSAGES.PHONE_ALREADY_IN_USE);
                    }
                }
            }
        }
        req.body.isEmailVerified = true;
        req.body.isPhoneVerified = true;
        req.body.password = await functions.hashPasswordUsingBcrypt(req.body.pass);
        req.body.role = constants.ROLE.SUBADMIN;
        let createAdmin = await Model.Admin.create(req.body);
        return res.success(constants.MESSAGES.SUCCESS, createAdmin);
    } catch (error) {
        next(error);
    }


};

module.exports.getAllSubAdmin = async (req, res, next) => {
    try {
        const lang = req.headers.lang || "en";
        let id = req.params.id;
        if (id == null) {
            let page = Number(req.query.page) || 1;
            page = page - 1;
            let limit = Number(req.query.limit) || 10;
            let qry = {
                role: constants.ROLE.SUBADMIN,
                isDeleted: false
            };
            if (req.query.search != "" && req.query.search != null) {
                const regex = {
                    $regex: `${req.query.search}`,
                    $options: "i"
                };
                qry.$or = [{
                    name: regex
                }, {
                    phoneNo: regex
                }, {
                    email: regex
                }];
            }
            let data = await Model.Admin.find(qry).sort({
                createdAt: -1
            }).skip(page * limit).limit(limit);

            let total = await Model.Admin.countDocuments({
                role: constants.ROLE.SUBADMIN,
                isDeleted: false
            });
            return res.success(constants.MESSAGES.DATA_FETCHED, {
                admin: data,
                total: total
            });
        } else {
            const data = await Model.Admin.findOne({
                _id: ObjectId(id),
                isDeleted: false
            });
            if (data == null) {
                throw new Error(constants.MESSAGES[lang].ACCOUNT_NOT_FOUND);
            }
            return res.success(constants.MESSAGES[lang].DATA_FETCHED, data);
        }
    } catch (error) {
        next(error);
    }
};
module.exports.updateSubAdmin = async (req, res, next) => {
    try {
        let qry = {
            isDeleted: false,
            _id: {
                $nin: [ObjectId(req.params.id)]
            }
        };
        let or = [];
        if (req.body.email) {
            or.push({
                email: req.body.email.toLowerCase()
            });
        }
        if (req.body.phoneNo) {
            or.push({
                phoneNo: req.body.phoneNo
            });
        }
        if (req.body.dialCode) {
            or.push({
                dialCode: req.body.dialCode
            });
        }
        or.push({
            role: constants.ROLE.SUBADMIN
        });

        qry.$or = or;
        console.log('qry: ', qry);

        if (or.length > 0) {
            let subAdmin = await Model.Admin.findOne(qry, {
                email: 1,
                phoneNo: 1,
                name: 1
            });
            console.log('subAdmin: ', subAdmin);

            if (subAdmin) {
                if (subAdmin.email == req.body.email) {
                    throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);

                }
                if (subAdmin.phoneNo == req.body.phoneNo) {
                    throw new Error(constants.MESSAGES.PHONE_ALREADY_IN_USE);
                }
            }
        }
        console.log("==================================================");
        let updatedAdmin = await Model.Admin.findOneAndUpdate({
            _id: ObjectId(req.params.id)
        }, {
            $set: req.body
        }, {
            new: true
        });

        return res.success(constants.MESSAGES.SUCCESS, updatedAdmin);

    } catch (error) {
        next(error);
    }
};

module.exports.deleteSubAdmin = async (req, res, next) => {
    try {
        let deleteAdmin = await Model.Admin.findOneAndUpdate({
            _id: ObjectId(req.params.id)
        }, {
            $set: {
                isDeleted: true
            }
        }, {
            new: true
        });
        if (!deleteAdmin) {
            throw new Error(constants.MESSAGES.SUBADMIN_NOT_DELETED);
        }
        return res.success(constants.MESSAGES.SUCCESS, deleteAdmin);

    } catch (error) {
        next(error);
    }
};