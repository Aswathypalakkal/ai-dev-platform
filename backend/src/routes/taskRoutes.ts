import { Router } from 'express';
const router = Router();

let tasks:any[] = [];

router.post("/", (req, res) => {
    console.log("task router called");
    console.log(req.body);

    tasks.push(req.body);

    res.json({
        message: "Task created"
    });
});


router.get("/", (req, res) => {
    res.json({
        tasks
    });
});
export default router;
