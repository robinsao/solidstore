import axios from "axios";
import { getTestAccessToken } from "../utils/auth";
import should from "should";
import { StatusCodes } from "http-status-codes";
import { FolderContentRes } from "../../controllers/folder";

describe("(Integration) folder", function () {
  this.timeout(5000);
  let accessToken;
  const folder = {
    id: -1,
    name: "top lvl",
    content: [
      {
        id: -2,
        name: "myfolder",
        type: "folder",
        path: ["top lvl", "myfolder"],
      },
    ],
    path: ["top lvl"],
  };

  before(async function () {
    accessToken = await getTestAccessToken();
  });

  describe("Unhappy paths", function () {
    it("(POST /:parentFolderId/:folderName) Given non-existing folder id, when create subfolder, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "POST",
          url: `http://localhost:${process.env.PORT}/folders/${"123"}/${
            folder.name
          }`,
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

    it("(GET /:id/path) Given non-existing folder id, when get path, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/folders/${"123"}/path`,
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

    it("(GET /:id/content) Given non-existing folder id, when get content, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/folders/${"123"}/path`,
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

    it("(DELETE /:id) Given non-existing folder id, when delete, should return 404 (NOT FOUND)", async function () {
      let res;
      try {
        res = await axios.request({
          method: "DELETE",
          url: `http://localhost:${process.env.PORT}/folders/${"123"}`,
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
    it("(POST /folderName) Given folder name, should create folder in root directory", async function () {
      const res = await axios.request({
        method: "POST",
        url: `http://localhost:${process.env.PORT}/folders/${encodeURIComponent(
          folder.name
        )}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      folder.id = res.data.id;
      res.status.should.be.eql(201);
    });

    it("(POST /parentFolderId/folderName) Given folder name, should create subfolder", async function () {
      const res = await axios.request({
        method: "POST",
        url: `http://localhost:${process.env.PORT}/folders/${
          folder.id
        }/${encodeURIComponent(folder.content[0].name)}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      folder.content[0].id = res.data.id;
      res.status.should.be.eql(201);
    });

    it("(GET /:id/content) Given existing folder id, should return content", async function () {
      // Act
      const content = (await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/folders/${folder.id}/content`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.files)) as FolderContentRes;

      // Assert
      [{ ...folder.content[0], isFolder: true }].should.be.containDeep(content);
    });

    it("(GET /:id/path) Given existing subfolder's id, should return path", async function () {
      // Act
      const path = (await axios
        .request({
          method: "GET",
          url: `http://localhost:${process.env.PORT}/folders/${folder.content[0].id}/path`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data.path)) as FolderContentRes;

      // Assert
      path[0].should.be.deepEqual({ name: folder.name, id: folder.id });
      path[1].should.be.deepEqual({
        name: folder.content[0].name,
        id: folder.content[0].id,
      });
    });

    it("(DELETE /:id) Given existing folder's id, can delete folder", async function () {
      const res2 = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/folders/${folder.content[0].id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const res1 = await axios.request({
        method: "DELETE",
        url: `http://localhost:${process.env.PORT}/folders/${folder.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      res1.status.should.be.eql(204);
      res2.status.should.be.eql(204);
    });
  });
});
