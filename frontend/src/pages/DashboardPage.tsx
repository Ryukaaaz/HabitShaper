import { useEffect, useState } from "react"
import api from "../services/api"

interface Habit {
  id: number
  name: string
  type: string
  streak?: number
  completionRate?: number
}

interface Goal {
  id: number
  title: string
  habit_id: number
  habit_name?: string
  habit_type?: string
}

export default function DashboardPage() {
  //habits
  const [habits, setHabits] = useState<Habit[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("BUILD")
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState("BUILD")

  //goals
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalTitle, setGoalTitle] = useState("")
  const [selectedHabitId, setSelectedHabitId] = useState("")
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null)
  const [editGoalTitle, setEditGoalTitle] = useState("")
  const [editGoalHabitId, setEditGoalHabitId] = useState("")

  const token = localStorage.getItem("token")

  //fetch habits for the logged in user
  const fetchHabits = async () => {
    try {

      const response = await api.get("/habits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const habitsData = response.data

      // fetch streak & weekly completion
      const updatedHabits = await Promise.all(

        habitsData.map(async (habit: Habit) => {

          const streakResponse = await api.get(
            `/habits/${habit.id}/streak`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          const weeklyResponse = await api.get(
            `/habits/${habit.id}/weekly`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          return {
            ...habit,
            streak: streakResponse.data.streak,
            completionRate: weeklyResponse.data.completionRate,
          }
        })
      )

      setHabits(updatedHabits)

    } catch (error) {
      console.log(error)
    }
  }

  //create a new habit for the logged in user
  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Habit name is required")
      return
    }

    try {
      await api.post(
        "/habits",
        {
          name,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setName("")
      setType("BUILD")

      fetchHabits()
    } catch (error) {
      console.log(error)
    }
  }

  const startEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id)
    setEditName(habit.name)
    setEditType(habit.type)
  }
  //update a habit for the logged in user
  const updateHabit = async (id: number) => {
  if (!editName.trim()) {
    alert("Habit name is required")
    return
  }

  try {
    await api.put(
      `/habits/${id}`,
      {
        name: editName,
        type: editType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    setEditingHabitId(null)

    fetchHabits()
  } catch (error) {
    console.log(error)
  }
  }

  //delete a habit for the logged in user
  const deleteHabit = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) {
      return
    }

    try {

      await api.delete(`/habits/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchHabits()

    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to delete habit"

      alert(message)
    }
  }

  //check habit completion for the logged in user
  const checkHabit = async (habitId: number) => {
    try {

      await api.post(
        `/habits/${habitId}/check`,
        {
          date: new Date().toISOString().split("T")[0],
          completed: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      fetchHabits()

    } catch (error) {
      console.log(error)
    }
  }

  //fetch goals for the logged in user
  const fetchGoals = async () => {
    try {

      const response = await api.get("/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setGoals(response.data)

    } catch (error) {
      console.log(error)
    }
  }

  //create a new goal for the logged in user
  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goalTitle.trim()) {
      alert("Goal title is required")
      return
    }

    try {

      await api.post(
        "/goals",
        {
          title: goalTitle,
          habit_id: selectedHabitId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setGoalTitle("")
      setSelectedHabitId("")

      fetchGoals()

    } catch (error) {
      console.log(error)
    }
  }
  
  const startEditGoal = (goal: Goal) => {
  setEditingGoalId(goal.id)
  setEditGoalTitle(goal.title)
  setEditGoalHabitId(goal.habit_id.toString())
}
  //update a goal for the logged in user
    const updateGoal = async (id: number) => {
      if (!editGoalTitle.trim()) {
        alert("Goal title is required")
        return
      }

      try {

        await api.put(
          `/goals/${id}`,
          {
            title: editGoalTitle,
            habit_id: editGoalHabitId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  title: editGoalTitle,
                  habit_id: Number(editGoalHabitId),
                }
              : goal
          )
        )

        setEditingGoalId(null)

      } catch (error) {
        console.log(error)
      }
    }
  //delete a goal for the logged in user
  const deleteGoal = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) {
      return
    } 

    try {
      await api.delete(`/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      fetchGoals()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchHabits()
    fetchGoals()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Habit Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Track your habits and improve daily
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/"
            }}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-2xl font-medium shadow-lg"
          >
            Logout
          </button>

        </div>

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm">
              Total Habits
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {habits.length}
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm">
              Build Habits
            </p>

            <h2 className="text-4xl font-bold mt-3 text-blue-400">
              {habits.filter((h) => h.type === "BUILD").length}
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm">
              Break Habits
            </p>

            <h2 className="text-4xl font-bold mt-3 text-pink-400">
              {habits.filter((h) => h.type === "BREAK").length}
            </h2>
          </div>

        </div>

        {/* create habit */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-10">

          <h2 className="text-2xl font-semibold mb-6">
            Create Habit
          </h2>

          <form
            onSubmit={createHabit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter habit name"
              className="bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BUILD" className="text-black">
                BUILD
              </option>

              <option value="BREAK" className="text-black">
                BREAK
              </option>
            </select>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition rounded-2xl font-semibold shadow-lg"
            >
              Add Habit
            </button>

          </form>

        </div>

        {/* habit list */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden">

          {/* table header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-semibold">
                Today's Habits
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Build consistency and track your progress daily
              </p>
            </div>

            <div className="flex gap-3">

              {/* <button
                className="bg-white/5 hover:bg-white/10 border border-white/10 transition px-5 py-2.5 rounded-2xl font-medium"
              >
                Weekly Report
              </button> */}

              {/* <button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition px-5 py-2.5 rounded-2xl font-medium shadow-lg"
              >
                + Add Goal
              </button> */}

            </div>

          </div>

          {/* table */}
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-white/5 border-b border-white/10">

                <tr className="text-left text-slate-300 text-sm">

                  <th className="px-6 py-4 font-medium">
                    Habit
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Type
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Current Streak
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Weekly Progress
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Today
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {habits.map((habit) => (

                  <tr
                    key={habit.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >

                    {/* habit */}
                    <td className="px-6 py-5">
                      {editingHabitId === habit.id ? (

                        <div className="space-y-3">

                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none"
                          />

                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none"
                          >
                            <option value="BUILD" className="text-black">
                              BUILD
                            </option>

                            <option value="BREAK" className="text-black">
                              BREAK
                            </option>
                          </select>

                        </div>

                        ) : (
                          <div>
                            <h3 className="font-semibold text-white">
                              {habit.name}
                            </h3>

                            <p className="text-xs text-slate-400 mt-1">
                              Stay consistent every day 
                            </p>
                          </div>

                        )}

                    </td>

                    {/* type */}
                    <td className="px-6 py-5">

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          habit.type === "BUILD"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-pink-500/20 text-pink-300"
                        }`}
                      >
                        {habit.type}
                      </span>

                    </td>

                    {/* streak */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 font-semibold">
                        🔥 {habit.streak || 0} days
                      </div>

                    </td>

                    {/* weekly progress */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-28 bg-white/10 rounded-full h-2 overflow-hidden">

                          <div
                            className="bg-green-400 h-full rounded-full"
                            style={{
                              width: `${habit.completionRate || 0}%`,
                            }}
                          />

                        </div>

                        <span className="text-sm text-slate-300">
                          {habit.completionRate || 0}%
                        </span>

                      </div>

                    </td>

                    {/* today status */}
                    <td className="px-6 py-5">

                      {habit.type === "BUILD" ? (

                        <button
                          onClick={() => checkHabit(habit.id)}
                          className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                        >
                          Done Today
                        </button>

                      ) : (

                        <button
                          className="bg-orange-500 hover:bg-orange-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                        >
                          Relapsed
                        </button>

                      )}

                    </td>

                    {/* actions */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        {editingHabitId === habit.id ? (

                          <>

                            <button
                              onClick={() => updateHabit(habit.id)}
                              className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                            >
                              Save
                            </button>

                            <button
                              onClick={() => setEditingHabitId(null)}
                              className="bg-slate-600 hover:bg-slate-700 transition px-4 py-2 rounded-xl text-sm font-medium"
                            >
                              Cancel
                            </button>

                          </>

                        ) : (

                          <>

                            <button
                              onClick={() => startEditHabit(habit)}
                              className="bg-yellow-500 hover:bg-yellow-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteHabit(habit.id)}
                              className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                            >
                              Delete
                            </button>

                          </>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </div>

        {/* goals section */}
        <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b border-white/10">

            <h2 className="text-2xl font-semibold">
              Goals
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Link goals to your habits and stay focused
            </p>

          </div>

          {/* create goal */}
          <div className="p-6 border-b border-white/10">

            <form
              onSubmit={createGoal}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >

              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Enter goal title"
                className="bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="" className="text-black">
                  Select Habit
                </option>

                {habits.map((habit) => (

                  <option
                    key={habit.id}
                    value={habit.id}
                    className="text-black"
                  >
                    {habit.name}
                  </option>

                ))}

              </select>

              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition rounded-2xl font-semibold shadow-lg"
              >
                Add Goal
              </button>

            </form>

          </div>

          {/* goal list */}
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-white/5 border-b border-white/10">

                <tr className="text-left text-slate-300 text-sm">

                  <th className="px-6 py-4">
                    Goal
                  </th>

                  <th className="px-6 py-4">
                    Linked Habit
                  </th>

                  <th className="px-6 py-4">
                    Type
                  </th>

                  <th className="px-6 py-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {goals.map((goal) => {

                  const linkedHabit = habits.find(
                    (h) => h.id === goal.habit_id
                  )

                  return (

                    <tr
                      key={goal.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >

                      <td className="px-6 py-5">
                        {editingGoalId === goal.id ? (
                          <input
                            type="text"
                            value={editGoalTitle}
                            onChange={(e) => setEditGoalTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none"
                          />
                        ) : (
                          <span className="font-medium">
                            {goal.title}
                          </span>

                        )}
                      </td>

                      <td className="px-6 py-5">
                        {editingGoalId === goal.id ? (
                          <select
                            value={editGoalHabitId}
                            onChange={(e) => setEditGoalHabitId(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none"
                          >
                            {habits.map((habit) => (
                              <option
                                key={habit.id}
                                value={habit.id}
                                className="text-black"
                              >
                                {habit.name}
                              </option>

                            ))}

                          </select>
                        ) : (
                          linkedHabit?.name || "-"
                        )}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            linkedHabit?.type === "BUILD"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-pink-500/20 text-pink-300"
                          }`}
                        >
                          {linkedHabit?.type}
                        </span>

                      </td>

                      <td className="px-6 py-5">
                        {/* action buttons goals */}
                        <div className="flex gap-3">
                          {editingGoalId === goal.id ? (
                            <>
                              <button
                                onClick={() => updateGoal(goal.id)}
                                className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                              >
                                Save
                              </button>

                              <button
                                onClick={() => setEditingGoalId(null)}
                                className="bg-slate-600 hover:bg-slate-700 transition px-4 py-2 rounded-xl text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditGoal(goal)}
                                className="bg-yellow-500 hover:bg-yellow-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-xl text-sm font-medium"
                              >
                                Delete
                              </button>

                            </>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  )
}