import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private service = new AuthService();

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await this.service.login(email, password);

    if (!result)
      return res.status(401).json({ message: "Invalid credentials" });

    return res.json(result);
  };
}
