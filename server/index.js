import express from "express";
import request from "request";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const app = express();
const port = process.env.PORT;

let refresh_token = loadRefreshToken();
let access_token = null;
;

function saveRefreshToken(token) {
    fs.writeFileSync("refresh.json", JSON.stringify({ refresh_token: token }));
}

function loadRefreshToken() {
    if (!fs.existsSync("refresh.json")) return null;
    return JSON.parse(fs.readFileSync("refresh.json")).refresh_token;
}

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(",") || "",
    credentials: true,
}));

app.get("/login", (req, res) => {
    const scope = "user-read-recently-played user-read-playback-state";

    const redirectUrl =
        "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" + process.env.SPOTIFY_CLIENT_ID +
        "&scope=" + encodeURIComponent(scope) +
        "&redirect_uri=" + encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI);

    res.redirect(redirectUrl);
});


app.get("/callback", (req, res) => {
    const code = req.query.code || null;

    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
            code: code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            grant_type: "authorization_code",
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID +
                    ":" +
                    process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            refresh_token = body.refresh_token;
            saveRefreshToken(refresh_token);

            console.log("ACCESS TOKEN: ", access_token);
            console.log("REFRESH TOKEN: ", refresh_token);

            res.send("Login successful! You may now close this window.");
        } else {
            res.status(500).send("OAuth failed.");
        }
    });
});

function refreshAccessToken(callback) {
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
            grant_type: "refresh_token",
            refresh_token: refresh_token,
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID +
                    ":" +
                    process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            console.log("🔄 Access token refreshed!");
            callback();
        } else {
            console.log("Failed to refresh token", body);
        }
    });
}

function callSpotifyApi(url, res) {
    const options = {
        url,
        headers: { Authorization: "Bearer " + access_token },
        json: true,
    };

    request.get(options, (error, response, body) => {
        if (response.statusCode === 401) {
            // access token expired → refresh then retry
            return refreshAccessToken(() => callSpotifyApi(url, res));
        }

        res.status(response.statusCode).send(body);
    });
}


app.get("/api/recently-played", (req, res) => {
    const { before, limit = 1 } = req.query;
    let queryString = `limit=${limit}`;
    if (before) queryString += `&before=${before}`;
    callSpotifyApi(
        `https://api.spotify.com/v1/me/player/recently-played?${queryString}`,
        res
    );
});




app.listen(port, () => {
    console.log(`Listening at http://127.0.0.1:${port}`)
})
