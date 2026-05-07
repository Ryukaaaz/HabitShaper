import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import habitRoutes from "./routes/habit.js"


const app = express()

app.use(cors())
app.use(express.json())

app.get("/ping", (_, res) => {
  res.json({ message: "Backend running" })
})

app.listen(3000, () => {
  console.log("Server running")
})

// import { db } from "./db/connection.js"

// db.getConnection()
//   .then(() => console.log("DB connected"))
//   .catch((err) => console.log(err))


app.use("/auth", authRoutes)

app.use("/habits", habitRoutes)