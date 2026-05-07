import express from "express"
import { db } from "../db/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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
  try {
    const { email, password } = req.body

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    const user = rows[0]

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    const token = jwt.sign(
      { id: user.id },
      "secretkey",
      { expiresIn: "7d" }
    )

    res.json({
      token
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Server error"
    })
  }
})

export default router

