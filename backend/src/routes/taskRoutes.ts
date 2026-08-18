import { Router } from "express";
import { Task } from "../../config/db";
const router = Router();
let tasks:any[] = [];
// CREATE TASK
router.post("/", async (req, res) => {
  try {
    console.log("task router called");
    console.log(req.body);

    const task = await Task.create(req.body);
    res.status(201).json({
      message: "Task created",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Task ID:", id);
    console.log("New status:", status);

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task status updated",
      task,
    });

  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      message: "Failed to update task status",
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();

    const formattedTasks = tasks.map((task) => ({
      ...task.toObject(),
      id: task._id.toString(),
    }));

    res.json({
      tasks: formattedTasks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});
export default router;
