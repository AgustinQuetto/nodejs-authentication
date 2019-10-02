const generateUUID = require("./AuthController").generateUUID;
const bcrypt = require("bcrypt");
const _ = require("lodash");

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

        body.email = _.get(req, "email") || _.get(req, "body.email");
        body.password = bcrypt.hashSync(body.password, this.salt);
        body.token = generateUUID();

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
        const id = _.get(req, "params.id");
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
}

module.exports = UserController;
