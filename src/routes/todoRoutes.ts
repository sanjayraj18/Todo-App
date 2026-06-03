import Router from "express";
import {
  deleteTodoController,
  getAllTodoController,
  postTodoController,
  updateTodoController,
} from "../controller/todoController";
import verifyAccessToken from "../middleware/authMiddleware";

const todoRouter = Router();

todoRouter.get("/get-all", verifyAccessToken, getAllTodoController);
todoRouter.post("/todo", verifyAccessToken, postTodoController);
todoRouter.patch("/:id", verifyAccessToken, updateTodoController);
todoRouter.delete("/:id", verifyAccessToken, deleteTodoController);

export default todoRouter;
