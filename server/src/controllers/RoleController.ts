import { Request, Response } from "express";
import { RoleService } from "../services/RoleService";

export class RoleController {
  private service = new RoleService();

  getAll = async (req: Request, res: Response) => {
    const roles = await this.service.getAll();
    return res.json(roles);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await this.service.getById(id);
    return res.json(role);
  };

  create = async (req: Request, res: Response) => {
    const { name } = req.body;
    const newRole = await this.service.create({ name });
    return res.status(201).json(newRole);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name } = req.body;
    const updated = await this.service.update(id, { name });
    return res.json(updated);
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return res.status(204).send();
  };
}
