import express from "express"
import { db } from "../db/connection.js"
import bcrypt from "bcrypt"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    )

    res.json({ message: "User registered" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  res.json({ message: "login route" })
})

export default router

