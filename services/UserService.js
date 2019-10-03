const config = require("../config");

class UserService {
    constructor(userModel, redisService) {
        this.userModel = userModel;
        this.redisService = redisService;
    }

    getAll(data = {}, select = "") {
        return this.userModel.find(data, select, { lean: true }).exec();
    }

    get(data = {}, select = "") {
        return this.userModel.findOne(data, select, { lean: true }).exec();
    }

    create(data = {}) {
        const user = new this.userModel(data);

        return user.save();
    }

    update(query = false, data = {}, opts = { returnNewDocument: true }) {
        if (!query) return false;

        return this.userModel.findOneAndUpdate(query, data, opts);
    }

    delete(query) {
        if (!query._id) {
            return false;
        }

        return this.userModel.findOneAndDelete(query);
    }

    errorManager(err) {
        console.log(err);
        return false;
    }
}

module.exports = UserService;
