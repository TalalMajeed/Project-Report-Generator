// To-Do List App using JavaScript

document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    // Load tasks from local storage
    loadTasks();

    // Add Task
    addTaskButton.addEventListener("click", function () {
      const taskText = taskInput.value.trim();
      if (taskText !== "") {
        addTask(taskText);
        taskInput.value = "";
        saveTasks();
      }
    });

    // Event delegation for delete and complete buttons
    taskList.addEventListener("click", function (event) {
      if (event.target.classList.contains("delete")) {
        event.target.parentElement.remove();
        saveTasks();
      } else if (event.target.classList.contains("complete")) {
        event.target.parentElement.classList.toggle("completed");
        saveTasks();
      }
    });

    // Function to add a task
    function addTask(taskText) {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="task">${taskText}</span>
        <button class="complete">✔</button>
        <button class="delete">❌</button>
      `;
      taskList.appendChild(li);
    }

    // Save tasks to local storage
    function saveTasks() {
      const tasks = [];
      document.querySelectorAll("#taskList li").forEach((task) => {
        tasks.push({
          text: task.querySelector(".task").textContent,
          completed: task.classList.contains("completed"),
        });
      });
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Load tasks from local storage
    function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks.forEach((task) => {
        const li = document.createElement("li");
        li.classList.toggle("completed", task.completed);
        li.innerHTML = `
          <span class="task">${task.text}</span>
          <button class="complete">✔</button>
          <button class="delete">❌</button>
        `;
        taskList.appendChild(li);
      });
    }
});
