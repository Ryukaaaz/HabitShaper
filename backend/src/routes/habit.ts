import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import { db } from "../db/connection.js"

const router = express.Router()
router.use(authMiddleware)

//get all habits for the logged in user
router.get("/", async (req: any, res) => {
  try {

    const [rows] = await db.query(
      "SELECT * FROM habits WHERE user_id = ?",
      [req.user.id]
    )

    res.json(rows)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//create a new habit for the logged in user
router.post("/", async (req: any, res) => {
  try {

    const { name, type } = req.body

    await db.query(
      "INSERT INTO habits (name, type, user_id) VALUES (?, ?, ?)",
      [name, type, req.user.id]
    )

    res.json({
      message: "Habit created"
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//update a habit for the logged in user
router.put("/:id", async (req: any, res) => {
  try {

    const { name, type } = req.body

    await db.query(
      `UPDATE habits
       SET name = ?, type = ?
       WHERE id = ? AND user_id = ?`,
      [name, type, req.params.id, req.user.id]
    )

    res.json({
      message: "Habit updated"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//delete a habit for the logged in user
router.delete("/:id", async (req: any, res) => {
  try {

    await db.query(
      "DELETE FROM habits WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    )

    res.json({
      message: "Habit deleted"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//track habit completion for the logged in user
router.post("/:id/check", async (req, res) => {
  try {

    const { date, completed } = req.body

    await db.query(
      `INSERT INTO habit_logs
       (habit_id, date, completed)
       VALUES (?, ?, ?)`,
      [req.params.id, date, completed]
    )

    res.json({
      message: "Habit tracked"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

export default router