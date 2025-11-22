import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  private service = new UserService();

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
    const { name, email, password, roleId } = req.body;
    const newUser = await this.service.create({
      name,
      email,
      password,
      roleId,
    });
    return res.status(201).json(newUser);
  };
  

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, email, password, roleId } = req.body;
  
    const updated = await this.service.update(id, {
      name,
      email,
      password,
      roleId,
    });
  
    return res.json(updated);
  };
  

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return res.status(204).send();
  };
}
