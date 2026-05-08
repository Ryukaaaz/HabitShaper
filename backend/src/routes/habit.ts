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

    // check habit logs
    const [logs]: any = await db.query(
      `
      SELECT id
      FROM habit_logs
      WHERE habit_id = ?
      LIMIT 1
      `,
      [req.params.id]
    )

    if (logs.length > 0) {
      return res.status(400).json({
        message: "Cannot delete habit with tracking history"
      })
    }

    await db.query(
      `
      DELETE FROM habits
      WHERE id = ? AND user_id = ?
      `,
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

// track habit completion for the logged in user
router.post("/:id/check", async (req, res) => {
  try {

    const { date, completed } = req.body

    // check if log already exists for today
    const [existingLogs]: any = await db.query(
      `
      SELECT id
      FROM habit_logs
      WHERE habit_id = ? AND date = ?
      `,
      [req.params.id, date]
    )

    // if already exists → update
    if (existingLogs.length > 0) {

      await db.query(
        `
        UPDATE habit_logs
        SET completed = ?
        WHERE habit_id = ? AND date = ?
        `,
        [completed, req.params.id, date]
      )

      return res.json({
        message: "Habit tracking updated"
      })
    }

    // if not exists → insert
    await db.query(
      `
      INSERT INTO habit_logs
      (habit_id, date, completed)
      VALUES (?, ?, ?)
      `,
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

//get habit streak 
router.get("/:id/streak", async (req, res) => {
  try {

    // get habit type
    const [habitRows]: any = await db.query(
      `
      SELECT type
      FROM habits
      WHERE id = ?
      `,
      [req.params.id]
    )

    const habit = habitRows[0]

    const [logs]: any = await db.query(
      `
      SELECT completed
      FROM habit_logs
      WHERE habit_id = ?
      ORDER BY date DESC
      `,
      [req.params.id]
    )

    let streak = 0

    for (const log of logs) {

      // BUILD habit
      if (
        habit.type === "BUILD" &&
        log.completed === 1
      ) {
        streak++
      }

      // BREAK habit
      else if (
        habit.type === "BREAK" &&
        log.completed === 0
      ) {
        streak++
      }

      else {
        break
      }
    }

    res.json({
      streak
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})


//get weekly completion rate for a habit
// weekly completion
router.get("/:id/weekly", async (req, res) => {
  try {

    const [rows]: any = await db.query(
      `
      SELECT completed, date
      FROM habit_logs
      WHERE habit_id = ?
      AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date ASC
      `,
      [req.params.id]
    )

    const totalDays = 7

    const completedDays = rows.filter(
      (log: any) => log.completed === 1
    ).length

    const missedDays = totalDays - completedDays

    const completionRate = Math.round(
      (completedDays / totalDays) * 100
    )

    res.json({
      completedDays,
      missedDays,
      completionRate,
      logs: rows
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })
  }
})

export default router