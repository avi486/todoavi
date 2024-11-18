import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:2222';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Fetch tasks from server
  useEffect(() => {
    axios.get(`${API_URL}/tasks`)
      .then(response => setTasks(response.data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  // Function to sort tasks by completion status and completion time
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      if (a.completed === b.completed) {
        if (a.completedAt && b.completedAt) {
          return new Date(a.completedAt) - new Date(b.completedAt); // Sort completed tasks by timestamp
        }
        return 0;
      }
      return a.completed ? 1 : -1; // Move completed tasks to the bottom
    });
  };

  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return; // Prevent empty tasks

    axios.post(`${API_URL}/tasks`, { title: newTask })
      .then(response => {
        const updatedTasks = [...tasks, response.data];
        setTasks(sortTasks(updatedTasks)); // Sort after adding a task
        setNewTask('');
      })
      .catch(err => console.error('Error adding task:', err));
  };

  // Delete a task
  const deleteTask = (id) => {
    axios.delete(`${API_URL}/tasks/${id}`)
      .then(() => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(sortTasks(updatedTasks)); // Sort after deleting a task
      })
      .catch(err => console.error('Error deleting task:', err));
  };

  // Mark a task as completed and move it to the bottom with timestamp
  const markComplete = (id) => {
    // Update task completion status and add the completed timestamp
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        task.completed = true; // Mark task as completed
        task.completedAt = new Date().toISOString(); // Record the timestamp when the task was completed
      }
      return task;
    });

    // Sort tasks: completed tasks go to the bottom and are ordered by their completion time
    setTasks(sortTasks(updatedTasks));
  };

  return (
    <div style={{ margin: '20px', textAlign: 'center' }}>
      <h1>To-Do List</h1>

      {/* Task input */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add a new task"
        style={{ padding: '10px', width: '300px' }}
      />
      <button onClick={addTask} style={{ padding: '10px 20px', marginLeft: '10px' }}>Add</button>

      {/* Task list */}
      <ul style={{ listStyleType: 'none', padding: '0', marginTop: '20px' }}>
        {tasks.map(task => (
          <li key={task.id} style={{
            margin: '10px 0px',
            display: 'flex',
            justifyContent: 'center',
            // Do not apply strike-through on task title
            textDecoration: 'none'
          }}>
            <span style={{ flex: 1 }}>{task.title}</span>

            {/* Delete button (only for uncompleted tasks) */}
            {!task.completed && (
              <button 
                onClick={() => deleteTask(task.id)} 
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                Delete
              </button>
            )}

            {/* Complete button (only for uncompleted tasks) */}
            {!task.completed ? (
              <button
                onClick={() => markComplete(task.id)}
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                Complete
              </button>
            ) : (
              // Completed button (disabled and strike-through applied)
              <button 
                disabled
                style={{ 
                  marginLeft: '10px', 
                  padding: '5px 10px', 
                  backgroundColor: 'grey', 
                  textDecoration: 'line-through'  // Strike-through only on the button
                }}
              >
                Completed
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
