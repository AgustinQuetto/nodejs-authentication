const env = process.env;
const getConfig = require("./getConfig");
const self = {};

self.version = "0.0";

self.port = getConfig(env.PORT, 3000);

self.BASE_URL = getConfig(
    env.BASE_URL,
    `https://example.com`,
    `https://dev.example.com`,
    `http://localhost:${self.port}`
);

self.mongodb = {
    ip: getConfig(env.MONGODB_IP, `localhost`),
    port: getConfig(env.MONGODB_PORT, `27017`),
    user: getConfig(env.MONGODB_USER, ``),
    password: getConfig(env.MONGODB_PASSWORD, ``),
    database: getConfig(env.MONGODB_DATABASE, `example`)
};

self.endpoints = {
    urlServer: getConfig(
        env.URLENDPOINT,
        `https://example.com`,
        `https://dev.example.com`,
        `http://localhost:${self.port}`
    )
};

self.redis = {
    connection: {
        url: getConfig(env.REDISURL, "redis", "127.0.0.1"),
        port: getConfig(env.REDISPORT, 6379)
    },
    expiration: { unit: "EX", value: 86400 }
};

self.s3 = {
    credentials: {
        accessKeyId: getConfig(env.S3ACCESSKEYID, ""),
        secretAccessKey: getConfig(env.S3SECRETACCESSKEY, "")
    }
};

self.loggly = {
    subdomain: getConfig(env.LOGGLYSUBDOMAIN, ""),
    token: getConfig(env.LOGGLYTOKEN, "")
};

self.sendgrid = {
    from: getConfig(env.SENDGRIDFROM, ""),
    apiKey: getConfig(env.SENDGRIDAPIKEY, ""),
    templates: {
        welcome: getConfig(env.SENDGRIDTEMPLATESWELCOME, "")
    }
};

self.auth = {
    expiration: { unit: "EX", value: 86400 } //1 day in seconds
};

self.passwordLevel = ["high", "medium"][0];

self.mongodbConnectionString = `mongodb://${self.mongodb.ip}:${self.mongodb.port}/${self.mongodb.database}`;

self.mongodbAuth = {
    auth: { authSource: self.mongodb.authSource },
    useMongoClient: true
};
if (self.mongodb.password) self.mongodbAuth.pass = self.mongodb.password;
if (self.mongodb.user) self.mongodbAuth.user = self.mongodb.user;

self.UserModelCustomProps = {
    profiles: [
        { kind: String, uid: String, username: String, password: String }
    ],
    employers: [{ label: String, position: String, since: Date, until: Date }]
};

module.exports = self;
