const config = require("./config");

const RedisService = require("./services/RedisService");
const RedisServiceInstance = new RedisService();

const UserController = require("./controllers/UserController");
const UserService = require("./services/UserService");
const UserModel = require("./models/UserModel");
const UserServiceInstance = new UserService(UserModel, RedisServiceInstance);

const UserInstance = new UserController(
    UserServiceInstance,
    RedisServiceInstance
);

const MailController = require("./controllers/MailController");
const MailControllerInstance = new MailController();

const AuthController = require("./controllers/AuthController");
const AuthService = require("./services/AuthService");
const AuthInstance = new AuthController(
    new AuthService(),
    RedisServiceInstance,
    UserInstance,
    MailControllerInstance
);

const FileService = require("./services/FileService");

module.exports = app => {
    app.use(async (req, res, next) => {
        console.log("Request path: ", req.originalUrl);
        next();
    });

    app.get("/", (req, res) => {
        return res.sendStatus(200);
    });

    app.get("/authorization", async (req, res) => {
        await AuthInstance.newAuthorization(req, res);
    });

    app.post(
        "/register",
        async (req, res) => await AuthInstance.register(req, res)
    );

    app.post("/login", async (req, res) => await AuthInstance.login(req, res));

    //API PROTECTED ENDPOINTS
    app.use(async (req, res, next) => {
        const session = await AuthInstance.decodeAuthorization(req);
        if (!session) {
            return res.status(403).json({
                error: "Your authorization token expired or there was an error."
            });
        }
        req.session = session;
        next();
    });

    app.get("/file/:bucket/:path/:file", FileService.getFromS3);
};
