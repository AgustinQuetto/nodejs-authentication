const generateUUID = require("./AuthController").generateUUID;
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");

class UserController {
    constructor(userService, redisService, mailController) {
        this.userService = userService;
        this.redisService = redisService;
        this.mailController = mailController;

        //bcrypt
        this.saltRounds = 10;
        this.salt = bcrypt.genSaltSync(this.saltRounds);
    }

    async create(req, res = false) {
        const body = req.body;

        if (!body.password) res ? res.sendStatus(500) : false;

        body.password = bcrypt.hashSync(body.password, this.salt);
        body.token = generateUUID();
        body.expiration = moment()
            .add(1, "days")
            .format("YYYY/MM/DD HH:mm:mm")
            .toString();

        const created = await this.userService.create(body);

        if (created._id) {
            this.redisService.set(
                `user-${created._id}`,
                JSON.stringify(created)
            );
            return res ? res.status(201).json(created) : created;
        }
        return res ? res.sendStatus(500) : false;
    }

    async get(req, res) {
        const id = _.get(req, "params._id");
        const email = _.get(req, "email") || _.get(req, "body.email");

        if (id || email) {
            const user = await this.userService.get(
                req.body,
                typeof res == "string" ? res : "-password -token -expiration"
            );

            if (user && user._id) {
                return typeof res == "string"
                    ? user
                    : res.status(200).json(user);
            }
            return typeof res == "string" ? res : res.sendStatus(404);
        }

        return typeof res == "string" ? res : res.sendStatus(500);
    }

    async update(req, res = false) {
        const body = req.body;

        if (!req.params._id) return res ? res.sendStatus(500) : false;
        const _id = req.params._id;
        delete req.params._id;

        if (body.password) {
            body.password = bcrypt.hashSync(body.password, this.salt);
        }

        const userUpdated = await this.userService.update({ _id: _id }, body);

        if (userUpdated && userUpdated._id) {
            this.redisService.set(
                `user-${userUpdated._id}`,
                JSON.stringify(userUpdated)
            );
            return res ? res.status(201).json(userUpdated) : userUpdated;
        }
        return res ? res.sendStatus(500) : false;
    }
}

module.exports = UserController;
