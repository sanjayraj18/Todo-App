import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import todoModal from "../models/todo.schema";

export const getAllTodoController = async (req: AuthRequest, res: Response) => {
  const userId = new Types.ObjectId(req.userId);

  const todos = await todoModal.find({ userId });

  const count = todos.length;

  res.status(200).json({
    count: count,
    data: todos,
  });
};

export const postTodoController = async (req: AuthRequest, res: Response) => {
  const userId = new Types.ObjectId(req.userId);
  const { title, description } = req.body;

  const todo = await todoModal.create({
    userId: userId,
    title: title,
    description: description,
  });

  res.status(201).json({
    data: todo,
  });
};

export const updateTodoController = async (req: AuthRequest, res: Response) => {
  const id = new Types.ObjectId(req.params.id as string);
  const userId = new Types.ObjectId(req.userId);

  const { title, description } = req.body;

  const todo = await todoModal.findByIdAndUpdate(
    { _id: id, userId },
    { title, description },
    { returnDocument: "after" },
  );

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  res.status(200).json({
    data: todo,
  });
};

export const deleteTodoController = async (req: AuthRequest, res: Response) => {
  const id = new Types.ObjectId(req.params.id as string);
  const userId = new Types.ObjectId(req.userId);

  const todo = await todoModal.findByIdAndDelete({
    _id: id,
    userId,
  });

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  res.status(200).json({
    message: "Todo deleted successfully",
  });
};
