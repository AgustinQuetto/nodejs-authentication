const fetch = require("isomorphic-fetch");
const _ = require("lodash");
const winston = require("winston");
const { Loggly } = require("winston-loggly-bulk");
const config = require("./config");

let self = {};

self.request = async (
    endpoint,
    method = "GET",
    body = {},
    headers = { Accept: "application/json", "Content-Type": "application/json" }
) => {
    method = method.toUpperCase();

    let res = {};
    body =
        headers["Content-Type"] === "application/json"
            ? JSON.stringify(body)
            : body;

    if (typeof headers !== "object") {
        console.log("You need put an object as headers.");
        return false;
    }

    if (endpoint == "") {
        return;
    }

    switch (method) {
        case "GET":
            res = await fetch(endpoint);
            try {
                res.data = await res.json();
            } catch (e) {}
            break;
        case "POST":
        case "PUT":
        case "DELETE":
            res = await fetch(endpoint, {
                method: method,
                headers: headers,
                body: body
            });
            try {
                res.data = await res.json();
            } catch (e) {}
            break;
    }
    return res;
};

self.getConfig = (processValue, productionValue, developValue, localValue) => {
    if (processValue) return processValue;
    const value =
        process.env.NODE_ENV === `production`
            ? productionValue
            : process.env.NODE_ENV === `develop`
            ? developValue || productionValue
            : localValue || developValue || productionValue;
    if (typeof value === `undefined`) {
        console.log(`config value undefined`);
    }
    return value;
};

self.replaceAll = (target, search, replacement) => {
    return target.replace(new RegExp(search, "g"), replacement);
};

self.deleteKeys = (obj, keys = []) => {
    keys.map(k => {
        _.unset(obj, k);
    });
    return obj;
};

winston.add(
    new Loggly({
        token: config.loggly.token,
        subdomain: config.loggly.subdomain,
        tags: ["serviceId"],
        json: true
    })
);

self.log = (element, opts = { level: "info" }) => {
    if (!element) return "Element undefined";
    if (!opts.level) opts.level = "info";

    winston.log(opts.level, element);
};

module.exports = self;
