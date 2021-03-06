import express, {Request, Response} from "express";

import {clearSession, getLink} from "../util";
import {PATH_PREFIX} from "../constants";

const router = express.Router();

/**
 * The default home page provides a simple view for entering a short link.
 */
router.get("/", async function (req, res, next) {
    console.log("/ - start");
    let opts = null;

    if (typeof (req.session as any).opts === "object") {
        console.log("/ - start; has session opts");
        opts = (req.session as any).opts;
        clearSession(req);
    } else {
        console.log("/ - start; no session opts");
        opts = {};
    }
    opts.prefix = PATH_PREFIX;

    console.log("rendering with opts: " + JSON.stringify(opts));
    res.render("home", opts);
    return;
});

/**
 * Main forwarding route.
 */
router.get("/*", async function (req, res, next) {
    let name = req.path;
    console.log("/* - start; name: " + name);
    sendToRedirect(name, req, res);
});

/**
 * Route used by the submit button on the homepage.
 */
router.post("/fwd", async function (req, res, next) {
    let name = req.body.name;
    console.log("/fwd - start; name: " + name);
    sendToRedirect(name, req, res);
});

function cleanName(name: string): string {
    if (typeof name === "string") {
        name = name.replace(/\/*$/, ""); // Remove trailing slash
        if (name.startsWith("/")) {
            name = name.substr(1); // trim first slash, if it exists
        }
    }
    return name;
}

function sendToRedirect(name: string, req: Request, res: Response) {
    name = cleanName(name);
    console.log("sendToRedirect - start; name: " + name);

    const url = getLink(name);
    if (url !== null) {
        // prefer redirect over a meta hack
        console.log("sendToRedirect - name: " + name);
        res.redirect(301, url);
    } else {
        let opts = {
            message: "Name not found: " + name,
            messageClass: "alert-danger",
            prefix: PATH_PREFIX
        };
        (req.session as any).opts = opts;
        console.log("sendToRedirect - prefix: " + PATH_PREFIX + "; opts: " + JSON.stringify(opts));
        if (PATH_PREFIX.trim().length < 1) {
            res.redirect("/");
        } else {
            res.redirect(PATH_PREFIX);
        }
    }
}

export default router;
