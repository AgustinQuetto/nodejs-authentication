const sgMail = require("@sendgrid/mail");
const config = require("../config");

class mailController {
    constructor() {}
    send(to, params) {
        params = {
            ...{
                templateId: false,
                templateValues: false,
                from: config.sendgrid.from
            },
            ...params
        };

        sgMail.setApiKey(config.sendgrid.apiKey);
        sgMail.setSubstitutionWrappers("{{", "}}");
        const msg = {
            to: to,
            from: params.from
        };

        if (params.subject && params.text) {
            msg.subject = subject;
            msg.text = text;
        } else if (
            params.subject &&
            params.templateId &&
            params.substitutions
        ) {
            msg.subject = params.subject;
            msg.templateId = params.templateId;
            msg.dynamic_template_data = params.substitutions;
        } else if (!params.subject) {
            console.log("Subject not defined");
            return;
        }

        if (params.categories) {
            msg.categories = params.categories;
        }

        sgMail.send(msg, false, err => {
            if (err) console.log(err);
        });
    }
}

module.exports = mailController;
