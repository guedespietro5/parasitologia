import { Request, Response } from "express";
import { ParasiteAgentService } from "../services/ParasiteAgentService";

export class ParasiteAgentController {
  private service = new ParasiteAgentService();

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
    const { name } = req.body;

    const newPost = await this.service.create({
      name
    });

    return res.status(201).json(newPost);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    const updatedPost = await this.service.update(id, {
      name
    });

    return res.json(updatedPost);
  };
  

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return res.status(204).send();
  };
}
