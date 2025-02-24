import axios from "axios";
import { getTestAccessToken } from "../utils/auth";
import { StatusCodes } from "http-status-codes";
import should from "should";

const fileName = "test.txt",
  fileType = "application/json",
  fileContent = {
    text: "Hello world",
  },
  file = new File([JSON.stringify(fileContent)], fileName, {
    type: fileType,
  });

describe("(Integration) file ", function () {
  this.timeout(5000);

  let url, fileId, accessToken;

  before(async function () {
    accessToken = await getTestAccessToken();
  });

  describe("Unhappy paths", function () {
    it("(GET /fileId/download-url) Given non-existing file id, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "GET",
          url: `http://localhost:${
            process.env.PORT
          }/files/${"1234"}/download-url`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        should.fail(res, {});
      } catch (e) {
        e.status.should.be.eql(StatusCodes.NOT_FOUND);
        return;
      }

      should.fail(res, { status: StatusCodes.NOT_FOUND });
    });

    it("(POST /fileId/upload-completion) Given non-existing file id, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "POST",
          url: `http://localhost:${
            process.env.PORT
          }/files/${"321"}/upload-completion`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            fileName,
          },
        });
      } catch (e) {
        e.status.should.be.eql(StatusCodes.NOT_FOUND);
        return;
      }

      should.fail(res, { status: StatusCodes.NOT_FOUND });
    });

    it("(DELETE /fileId) Given non-existing file id, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "DELETE",
          url: `http://localhost:${process.env.PORT}/files/${"sfasd"}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (e) {
        e.status.should.be.eql(StatusCodes.NOT_FOUND);
        return;
      }

      should.fail(res, { status: StatusCodes.NOT_FOUND });
    });
  });

  describe("Happy paths", function () {
    it("(GET /fileName/upload-url) Given file name, can request upload url", async function () {
      const res = await axios.request({
        method: "GET",
        url: `http://localhost:${process.env.PORT}/files/${fileName}/upload-url`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": fileType,
        },
      });

      url = res.data.url;
      fileId = res.data.fileId;
      url.should.containEql(
        `${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`
      );
    });

    it("(POST /fileId/upload-completion) Given file id, when finish uploading, can complete file upload", async function () {
      // Upload file
      await axios.request({
        method: "PUT",
        url,
        headers: {
          "Content-Type": fileType,
          "Content-Length": file.size,
        },
        data: file,
      });

      // Call complete upload endpoint
      const res = await axios.request({
        method: "POST",
        url: `http://localhost:${process.env.PORT}/files/${fileId}/upload-completion`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          fileName,
        },
      });
      res.status.should.be.eql(StatusCodes.CREATED);
    });

    it("(GET /fileId/download-url) Given existing file id, can request file download url", async function () {
      const downloadUrl = await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/files/${fileId}/download-url`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.url);

      const fileData = (await axios
        .request({
          method: "GET",
          url: downloadUrl,
          responseType: "arraybuffer",
        })
        .then((res) => res.data)) as Buffer;

      // Assert
      JSON.stringify(fileContent).should.be.eql(fileData.toString());
    });

    it("(DELETE /fileId) Given existing file id, can delete file", async function () {
      const res = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/files/${fileId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      res.status.should.be.eql(StatusCodes.NO_CONTENT);
    });
  });
});
