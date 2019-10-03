# nodejs-authentication

Agustín Quetto 2019

These server includes:

-   Login, register and confirmation notification
-   Controllers, models and services files
-   Session middleware protection
-   Session information in req.session
-   Winston and Loggly as logs managment
-   Sendgrid integration
-   Dynamic configuration between enviroments
-   Amazon S3 - access to public and private files
-   CircleCI deployment
-   Docker and docker-compose with Redis and MongoDB
-   Redis as cache layer

Postman collection:

-   https://www.getpostman.com/collections/38af6e6989900c99a30c

Configuration:

-   config.js has dynamic configurations.
-   It is determined by prior. Environment variable, productive constant, development constant, local constant.
-   The priority responds to the value of the NODE_DEV environment variable. If the environment variable of a specific configuration is defined, it will be taken as a priority first.

User model extension:

-   The idea of this server base is have an abstraction of methods, keeping the core code unchanged and impacting through the configuration.
-   If you need to extend the user's model, you can do so by adding properties in UserModelCustomProps. This will be unified to the model.

Password strength:

-   Two levels are defined: high (default) and medium.
    -   High minium requirements: 1 symbol, 1 capital letter, 1 number and 8 character length.
    -   Medium minium requirements: 1 number and 6 character length.

Sendgrid emails:

-   Sendgrid is used as a third-party messaging service and is integrated into mailController. The library is abstracted in the send method of the class. You can configure the apikey and the sender in config.js

Sendgrid templates:

-   Welcome: it has the dynamic values "name" (firstname) and "confirmation" (link).

Terminal commands:

-   npm run local (local development)
-   npm run dev (server development)
-   npm start (server production)

Done:

-   Register
-   Login
-   Confirmation with session token.

Pending:

-   Password recovery
-   Integration with third parties services like Google.
-   Frontend usign React+Redux with session data managment
