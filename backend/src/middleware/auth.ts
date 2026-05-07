import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, "secretkey")

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    })
  }
}