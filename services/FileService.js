const config = require("../config");
const AWS = require("aws-sdk");

class FileService {
    static async getFromS3(req, res) {
        if (!req.session) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const fileUrl = `https://s3.amazonaws.com/${req.params.bucket}/${
            req.params.path
        }/${req.params.file}`;
        try {
            const file = await FileService.getBase64ImageS3(fileUrl);
            if (file)
                return res
                    .status(200)
                    .json({ base64: file, filename: req.params.file });
        } catch (e) {
            console.log(e);
            return res.sendStatus(404);
        }
    }

    static getBase64ImageS3(url) {
        return new Promise((resolve, reject) => {
            const keyUrl = url.split("/").pop();

            const s3 = new AWS.S3(config.s3.credentials);

            const params = {
                Bucket: "test.digiventures",
                Key: "digiventures/" + keyUrl
            };

            s3.getObject(params, (err, file) => {
                if (err) {
                    reject(err);
                }

                let base64 = Buffer.from(file.Body).toString("base64");

                if (base64.indexOf("dataapplicationpdfbase64") != -1) {
                    base64 = base64.replace(
                        "dataapplicationpdfbase64",
                        "data:application/octet-stream;base64,"
                    );

                    return resolve(base64);
                }

                resolve("data:image/png;base64," + base64);
            });
        });
    }
}

module.exports = FileService;
