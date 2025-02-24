import axios from "axios";
import { getTestAccessToken } from "../utils/auth";
import { StatusCodes } from "http-status-codes";
import should from "should";

// TODO: remove setTimeout
describe("(Integration) file-item", function () {
  this.timeout(5000);

  let accessToken;
  const file = {
      id: -1,
      name: "testfile.json",
      parentFolder: {
        name: "folderwithfile",
        id: -1,
      },
      type: "application/json",
      blob: new File(
        [JSON.stringify({ test: "Hello World" })],
        "testfile.json",
        {
          type: "application/json",
        }
      ),
    },
    folder = {
      id: -1,
      name: "testfolder",
    };

  before(async function () {
    accessToken = await getTestAccessToken();
  });

  describe("Unhappy paths", function () {
    it("(GET /:fileId/path) Given non-existing file item id, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/fileitems/${file.id}/path`,
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
    it("(DELETE /:fileId) Given non-existing file item id, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "DELETE",
          url: `http://localhost:${process.env.PORT}/fileitems/${file.id}`,
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
    it("(GET /:fileId/path) Given existing file id, can get path", async function () {
      // Setup
      file.parentFolder.id = await axios
        .request({
          method: "POST",
          url: `http://localhost:${process.env.PORT}/folders/${file.parentFolder.name}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.id);

      const { url, fileId } = await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/files/${file.parentFolder.id}/${file.name}/upload-url`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": file.type,
          },
        })
        .then((res) => res.data);
      file.id = fileId;

      // Upload file
      await axios.request({
        method: "PUT",
        url,
        headers: {
          "Content-Type": file.type,
          "Content-Length": file.blob.size,
        },
        data: file.blob,
      });
      // Call complete upload endpoint
      await axios.request({
        method: "POST",
        url: `http://localhost:${process.env.PORT}/files/${file.parentFolder.id}/${fileId}/upload-completion`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          fileName: file.name,
        },
      });

      // Get path
      const path = await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/fileitems/${file.id}/path`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.path);
      // Assert
      (path as Array<{ id: string; name: string }>).should.be.deepEqual([
        { id: file.parentFolder.id, name: file.parentFolder.name },
        { id: file.id, name: file.name },
      ]);
    });
    it("(GET /:fileId/path) Given valid folder id, can get path", async function () {
      // Arrange
      const { id } = await axios
        .request({
          method: "POST",
          url: `http://localhost:${
            process.env.PORT
          }/folders/${encodeURIComponent(folder.name)}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data);
      folder.id = id;

      // Act
      const path = await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/fileitems/${folder.id}/path`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.path);

      // Assert
      (path as Array<{ id: string; name: string }>).should.be.deepEqual([
        { id: id, name: folder.name },
      ]);
    });
    it("(DELETE /:fileId) Given valid file id, can delete", async function () {
      const res1 = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/fileitems/${file.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const res2 = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/fileitems/${file.parentFolder.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      res1.status.should.be.eql(StatusCodes.NO_CONTENT);
      res2.status.should.be.eql(StatusCodes.NO_CONTENT);
    });
    it("(DELETE /:fileId) Given valid folder id, can delete", async function () {
      const res = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/fileitems/${folder.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      res.status.should.be.eql(StatusCodes.NO_CONTENT);
    });
  });
});
