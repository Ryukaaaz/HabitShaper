import express from "express"
import { db } from "../db/connection.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

router.use(authMiddleware)

//create a new goal for the logged in user
router.post("/", async (req: any, res) => {
  try {

    const { title, habit_id } = req.body

    await db.query(
      `INSERT INTO goals (title, habit_id)
       VALUES (?, ?)`,
      [title, habit_id]
    )

    res.json({
      message: "Goal created"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//read all goals for the logged in user
router.get("/", async (req: any, res) => {
  try {

    const [rows] = await db.query(`
      SELECT goals.*
      FROM goals
      JOIN habits ON goals.habit_id = habits.id
      WHERE habits.user_id = ?
    `, [req.user.id])

    res.json(rows)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//update a goal for the logged in user
router.put("/:id", async (req: any, res) => {
  try {

    const { title } = req.body

    await db.query(
      "UPDATE goals SET title = ? WHERE id = ?",
      [title, req.params.id]
    )

    res.json({
      message: "Goal updated"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

//delete a goal for the logged in user
router.delete("/:id", async (req, res) => {
  try {

    await db.query(
      "DELETE FROM goals WHERE id = ?",
      [req.params.id]
    )

    res.json({
      message: "Goal deleted"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})
export default router