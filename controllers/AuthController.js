const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const config = require("../config");

class AuthController {
    constructor(AuthService, RedisService, UserController, mailController) {
        this.apiService = AuthService;
        this.userController = UserController;
        this.redisService = RedisService;
        this.mailController = mailController;

        this.saltRounds = 10;
        this.salt = bcrypt.genSaltSync(this.saltRounds);
    }

    async decodeAuthorization(req) {
        try {
            let tokenValue =
                _.get(req, "query.authorization") ||
                _.get(req, "headers.authorization") ||
                _.get(req, "cookies.authorization");
            if (tokenValue) {
                const dataRedis = await this.redisService.get(tokenValue);
                if (dataRedis) {
                    const userData = await this.redisService.get(
                        `user-${dataRedis}`
                    );
                    return JSON.parse(userData);
                }
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    async login(req, res) {
        const errorMessage = "Error creating a session token.";
        try {
            const newToken = await this.getNewToken();

            if (!newToken) {
                throw errorMessage;
            }

            const userData = await this.userController.get(
                {
                    email: req.body.email
                },
                ""
            );

            if (
                !userData ||
                !bcrypt.compareSync(req.body.password, userData.password)
            )
                return res.status(404).json({ message: "User not found" });

            const tokenCreated = await this.redisService.set(
                newToken,
                userData._id.toString()
            );
            if (newToken && tokenCreated) {
                return res.status(201).json({
                    authorization: newToken,
                    expiration: moment()
                        .add(24, "hours")
                        .format(),
                    data: {
                        fullname: `${userData.firstname} ${userData.lastname}`.toUpperCase()
                    }
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: errorMessage });
        }
    }

    generateUUID() {
        return AuthController.generateUUID();
    }

    static generateUUID() {
        let d = new Date().getTime();
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            c => {
                const r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
        );
        return uuid;
    }

    async getNewToken() {
        let token = this.generateUUID();

        const tokenTenant = await this.redisService.get(token);

        if (tokenTenant) {
            return this.getNewToken();
        } else {
            return token;
        }
    }

    async register(req, res) {
        if (!this.validPassword(req.body.password))
            return res.status(500).json({ error: "Low password strength" });

        const userData = await this.userController.create(req);

        if (!userData) return res.sendStatus(500);

        const substitutions = {
            name: `${userData.firstname}`.toUpperCase(),
            password_link: `${config.BASE_URL}/confirmation/${userData._id}/${userData.token}`
        };

        if (!config.sendgrid.templates.welcome) {
            return res.status(201).json(substitutions);
        }

        this.mailController.send(userData.email, {
            templateId: config.sendgrid.templates.welcome,
            subject: "Welcome",
            substitutions: substitutions,
            categories: ["Welcome"]
        });

        return res.sendStatus(201);
    }

    async confirmation(req, res) {
        const errorMessage = "Account confirmation error.";
        req.body = { token: req.params.token, confirmed: false };

        try {
            const userData = await this.userController.get(req, "");

            if (!userData)
                return res.status(404).json({ message: "User not found" });

            req.body.confirmed = true;
            const userDataConfirmed = await this.userController.update(req);

            if (userDataConfirmed && userDataConfirmed._id) {
                const newToken = await this.getNewToken();

                if (!newToken) {
                    throw errorMessage;
                }

                const tokenCreated = await this.redisService.set(
                    newToken,
                    userDataConfirmed._id.toString()
                );
                if (newToken && tokenCreated) {
                    return res.status(201).json({
                        authorization: newToken,
                        expiration: moment()
                            .add(24, "hours")
                            .format(),
                        data: {
                            fullname: `${userDataConfirmed.firstname} ${userDataConfirmed.lastname}`.toUpperCase()
                        }
                    });
                }
            } else {
                return res
                    .status(500)
                    .json({ message: "Your user cannot be confirmed." });
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: errorMessage });
        }
    }

    validPassword(value) {
        const strongRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );
        const mediumRegex = new RegExp(
            "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
        );

        if (strongRegex.test(value) || mediumRegex.test(value)) {
            return true;
        }
        return false;
    }
}

module.exports = AuthController;
