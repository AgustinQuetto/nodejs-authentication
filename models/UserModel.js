const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require("../config");

mongoose.set("useCreateIndex", true);

const defaultProps = {
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: String,
    gender: String,
    password: String,
    token: String,
    expiration: Date,
    confirmed: {
        type: Boolean,
        default: false
    }
};

const userModel = { ...defaultProps, ...config.UserModelCustomProps };

const UserSchema = new Schema(userModel, {
    timestamps: true
});

module.exports = mongoose.model("users", UserSchema);
