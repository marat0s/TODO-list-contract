import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import  contractABI from './TODO_LIST_ABI.json';
import './App.css';

const contractAddress = "0xba0E7149f3B24F29fD88bB65329B58fdd84D6195"; // Replace with your contract's address

function EnhancedTodoListApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState({ id: null, task: '' });
  const [contract, setContract] = useState(null);


  // Initialize contract and setup event listeners
  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request account access
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
    };
    init();
  }, []);

  // Fetch all tasks from the blockchain
  const fetchTasks = async () => {
    if (!contract) return;
    const tasksFromContract = await contract.getAllTasks();
    setTasks(tasksFromContract);
  };

  // Event listener setup
  useEffect(() => {
    if (contract) {
      const onTaskAdded = () => fetchTasks();
      const onTaskCompleted = () => fetchTasks();
      const onTaskModified = () => fetchTasks();
      const onTaskDeleted = () => fetchTasks();

      contract.on("TaskAdded", onTaskAdded);
      contract.on("TaskCompleted", onTaskCompleted);
      contract.on("TaskModified", onTaskModified);
      contract.on("TaskDeleted", onTaskDeleted);

      // Cleanup function to remove event listeners
      return () => {
        contract.off("TaskAdded", onTaskAdded);
        contract.off("TaskCompleted", onTaskCompleted);
        contract.off("TaskModified", onTaskModified);
        contract.off("TaskDeleted", onTaskDeleted);
      };
    }
  }, [contract]);

  // Function to add a task
  const handleAddTask = async () => {
    if (!contract) return;
    await contract.addTask(newTask);
    setNewTask('');
  };

  // Function to complete a task
  const handleCompleteTask = async (id) => {
    if (!contract) return;
    await contract.completeTask(id);
  };

  // Function to modify a task
  const handleModifyTask = async (id, task) => {
    if (!contract) return;
    await contract.modifyTask(id, task);
    setEditingTask({ id: null, task: '' }); // Clear the edit state
  };

  // Function to delete a task
  const handleDeleteTask = async (id) => {
    if (!contract) return;
    try {
      const deleteTx = await contract.deleteTask(id);
      await deleteTx.wait(); // Wait for the transaction to be mined
      setTasks(currentTasks => currentTasks.filter((task, index) => index !== id));
    } catch (error) {
      console.error("Failed to delete the task:", error);
    }
  };
  // On component mount, fetch tasks
  useEffect(() => {
    if (contract) {
      fetchTasks();
    }
  }, [contract]);


  return (
      <div>
        <h1>Todo List using Blockchain</h1>
        <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
        <ul>
          {tasks.map((task, index) => {

            // Check if the timestamp is 0 or corresponds to the Unix epoch start time
            if (task.timestamp < 1) {
              // Don't render this task
              return null;
            }

            // Convert the timestamp to a local date string
            return (
                <li key={index} className={task.isCompleted ? 'completed-task' : ''}>
                  <div className="task">
                    Task: {task.task}
                    <br />
                    Completed: {task.isCompleted ? 'Yes' : 'No'}
                    <br />
                    Timestamp: {new Date(task.timestamp * 1000).toLocaleString()}
                    <br />
                    <div className="buttons">
                      <button onClick={() => handleCompleteTask(index)}>Complete Task</button>
                      <button onClick={() => setEditingTask({ id: index, task: task.task })}>
                        Edit Task
                      </button>
                      {editingTask.id === index && (
                          <div>
                            <input
                                type="text"
                                className="edit-input"
                                value={editingTask.task}
                                onChange={(e) => setEditingTask({ ...editingTask, task: e.target.value })}
                            />
                            <button onClick={() => handleModifyTask(index, editingTask.task)}>
                              Save Changes
                            </button>
                          </div>
                      )}
                      <button onClick={() => handleDeleteTask(index)}>Delete Task</button>
                    </div>
                  </div>
                </li>
            );
          })}
        </ul>
      </div>
  );
}

export default EnhancedTodoListApp;