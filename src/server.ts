import express from 'express';
import {Application, Request, Response, NextFunction, Errback} from "express";

import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

    const app: Application = express();

    const port: number = Number(process.env.PORT) || 8082;

    app.use(bodyParser.json());

    // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // IT SHOULD
    //    1
    //    1. validate the image_url query
    //    2. call filterImageFromURL(image_url) to filter the image
    //    3. send the resulting file in the response
    //    4. deletes any files on the server on finish of the response
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]


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
        (req: Request, res: Response, next: NextFunction) => {
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
                )
            } else {
                next();
            }
        },
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                let absolutePath: string = await filterImageFromURL(req.query.image_url);
                res.sendFile(absolutePath, {}, async (err) => {
                    if (err) {
                        next(err);
                    } else {
                        await deleteLocalFiles([absolutePath]);
                        return res.status(200);
                    }
                });
            } catch (e) {
                next(e)
            }
        }
    );



    app.get( "/", async ( req, res ) => {
        res.send("try GET /filteredimage?image_url={{}}")
    } );

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
