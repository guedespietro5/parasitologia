import { Request, Response } from "express";
import { PostService } from "../services/PostService";

export class PostController {
  private service = new PostService();

  getAll = async (req: Request, res: Response) => {
    const users = await this.service.getAll();
    return res.json(users);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await this.service.getById(id);
    return res.json(user);
  };

   create = async (req: Request, res: Response) => {
    const { title, content, imageUrl, authorId, validated } = req.body;

    const newPost = await this.service.create({
      title,
      content,
      imageUrl,
      authorId,
    });

    return res.status(201).json(newPost);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { title, content, imageUrl, authorId, validated } = req.body;

    const updatedPost = await this.service.update(id, {
      title,
      content,
      imageUrl,
      authorId,
      validated,
    });

    return res.json(updatedPost);
  };
  

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return res.status(204).send();
  };
}
