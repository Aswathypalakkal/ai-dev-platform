import { Router } from 'express';
import { File } from "../../config/db";
const router = Router();
router.get('/', (req, res) => {
  // TODO: implement real file listing from dbService
  console.log("in file route")
  res.json({ files: ["file1","file2"] });
});
router.post('/', (req, res) => {
  console.log("request is :",req.body.content)
  var content = req.body.content;
  // took first 5 letters from the content as file name  // should update  
  var path = content.slice(0, 5);
  console.log("path :",path)

  async function createUser() {
    const file = new File({
    filename: path,
    filecontent: content,
    createduser: "Aswathy"
    });
    await file.save();
    console.log("User saved");
  }
createUser();
  // TODO: implement real file listing from dbService
  console.log("in file route post ")
  res.json({ files: [] });
});
export default router;
