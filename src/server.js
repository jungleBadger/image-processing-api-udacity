const express = require("express");
const bodyParser = require("body-parser");


const {filterImageFromURL, deleteLocalFiles} = require("./util/util");

(async () => {

    const app = express();

    const port = Number(process.env.PORT) || 8082;

    app.use(bodyParser.json());

    /**
     * @swagger
     * /filteredimage:
     *   get:
     *     summary: endpoint to filter an image from a public url.
     *     produces:
     *       - application/json
     *     parameters:
     *      - name: image_url
     *        in: query
     *        required: true
     *        description: URL of a publicly accessible image
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: Filtered image file.
     *       500:
     *         description: Internal server error.
     */
    app.get("/filteredimage",
        (req, res, next) => {
            if (!req.query.image_url) {
                next(
                    new Error(
                        JSON.stringify(
                            {
                                "status": 400,
                                "message": "Missing image URL parameter."
                            }
                        )
                    )
                );
            } else {
                next();
            }
        },
        async (req, res, next) => {
            try {
                let absolutePath = await filterImageFromURL(req.query.image_url);
                res.sendFile(absolutePath, {}, async (err) => {
                    if (err) {
                        next(err);
                    } else {
                        await deleteLocalFiles([absolutePath]);
                        return res.status(200);
                    }
                });

            } catch (e) {
                return next(e);
            }
        }
    );



    app.get( "/", async ( req, res ) => {
        res.send("try GET /filteredimage?image_url={{}}")
    } );

    app.use((err, req, res, next) => {
        try {
            if (Object.prototype.hasOwnProperty.call(err, "status")) {
                return res.status(err.status || 500).send(err.message || err);
            } else {
                let parsedError = JSON.parse(err.message);
                return res.status(parsedError.status || 500).send(parsedError.message || err.message || "Unknown Error");
            }
        } catch (e) {
            return res.status(err.status || 500).send(err.message || err);
        }
    });


    // Start the Server
    app.listen( port, () => {
        console.log( `server running http://localhost:${ port }` );
        console.log( `press CTRL+C to stop server` );
    } );
})();
