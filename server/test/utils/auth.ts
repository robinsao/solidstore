import axios from "axios";
import { readFile, writeFile } from "fs/promises";
import { decode } from "jsonwebtoken";

let accessToken;

// Period before an existing creds' expiration, during which new creds would be obtained if tests were ran in that period.
// Period here is in seconds
const PERIOD_GENERATE_NEW_CREDS = 2 * 60;

export async function getTestAccessToken() {
  try {
    const authJson = JSON.parse(
      await readFile("./test/utils/authcreds.json", { encoding: "utf8" })
    );
    accessToken = decode(authJson.accessToken);

    if (
      accessToken &&
      accessToken.exp &&
      (accessToken.exp as number) - Date.now() / 1000 >=
        PERIOD_GENERATE_NEW_CREDS
    ) {
      accessToken = authJson.accessToken;
      return accessToken;
    }
  } catch (e) {
    console.log(e);
  }

  const options = {
    method: "POST",
    url: `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams({
      grant_type: "password",
      username: process.env.TEST_AUTH0_USER_EMAIL,
      password: process.env.TEST_AUTH0_USER_PASSWORD,
      audience: process.env.AUTH0_API_ID,
      scope: `${process.env.READ_FILES_SCOPE} ${process.env.CREATE_FILES_SCOPE} ${process.env.DELETE_FILES_SCOPE}`,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
    }),
  };

  accessToken = await axios
    .request(options)
    .then(function (response) {
      return response.data.access_token;
    })
    .catch(function (error) {
      console.error(error);
    });

  try {
    await writeFile(
      "./test/utils/authcreds.json",
      JSON.stringify({ accessToken })
    );
  } catch (e) {
    console.log(e);
  }

  return accessToken;
}
