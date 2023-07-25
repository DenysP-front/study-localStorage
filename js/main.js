const addTaskForm = document.forms.addTask,
  formFields = document.querySelectorAll(".form-field"),
  taskList = document.querySelector(".task-list"),
  allTaskArray = JSON.parse(localStorage.getItem("allTasks")) || [],
  notifications = document.querySelector(".notifications");

const messages = {
  errorEmpty: "Це поле не може бути порожнім",

  errorText:
    "Довжина тексту не може бути більшою за 100 символів і меншою за 3 символи.",

  errorDate: {
    smData: "Дата має бути хоча б трохи більша за поточну",
    lgData: "Не плануй так далеко, не далі року",
  },
  errorTime: {
    smTime: "Час має бути хоча б на 30 хв більший за поточний",
    getData: "Спочатку правильно заповніть поле з датою",
  },
  notifications: {
    addTask: "Додано нове завдання",
    doneTask: "Завдання виконано",
    removeTask: "Завдання видаленно",
  },
};

function formInputHandler(e) {
  const target = e.target;
  switch (target.getAttribute("name")) {
    case "taskText":
      checkTextareaLength(target, messages.errorText);
      break;
    case "taskDate":
      checkData(target, messages.errorDate);
      break;
    case "taskTime":
      checkTime(target, messages.errorTime);
      break;
  }
}

function addFormValidation(formName) {
  formName.addEventListener("input", formInputHandler);
  for (const input of formFields) {
    input.addEventListener("focus", () => {
      checkOnFocus(input, messages.errorEmpty);
    });
    input.addEventListener("blur", () => {
      checkOnBlur(input);
    });
  }
}
addFormValidation(addTaskForm);

function checkTextareaLength(target, message) {
  if (target.value.length < 3 || target.value.length > 100) {
    addFieldError(target, message);
  } else {
    addFieldSuccess(target);
  }
}

function addFieldSuccess(target) {
  const group = target.closest(".add-task__group");
  group.classList.remove("error");
  group.classList.add("success");
  group.querySelector(".form-error-msg").textContent = "";
}

function addFieldError(target, errorMessage) {
  const group = target.closest(".add-task__group");
  group.classList.remove("success");
  group.classList.add("error");
  group.querySelector(".form-error-msg").textContent = errorMessage;
}

function checkData(target, message) {
  const inputDate = Date.parse(target.value);
  const currentTime = convertStringTimeToMs(
    `${new Date().getHours()}:${new Date().getMinutes()}`
  );
  const currentDate = Date.now() - currentTime;
  const yearsInMs = 365.2425 * 24 * 3600 * 1000;
  const diffInHours =
    convertStringTimeToMs(addTaskForm.taskTime.value) - currentTime;

  if (inputDate < currentDate) {
    addFieldError(target, message.smData);
  } else if (inputDate - currentDate > yearsInMs) {
    addFieldError(target, message.lgData);
  } else {
    addFieldSuccess(target);

    if (
      (addTaskForm.taskTime.value.length > 1 && diffInHours > 30 * 60000) ||
      Math.round((inputDate - currentDate) / (24 * 3600 * 1000)) > 0
    ) {
      addFieldSuccess(addTaskForm.taskTime);
    } else {
      addFieldError(addTaskForm.taskTime, messages.errorTime.smTime);
    }
  }
}

function convertStringTimeToMs(stringTime) {
  const timeParts = stringTime.split(":");
  return (+timeParts[0] * 60 + +timeParts[1]) * 60000;
}

function checkTime(target, message) {
  const inputTime = convertStringTimeToMs(target.value);
  const currentTime = convertStringTimeToMs(
    `${new Date().getHours()}:${new Date().getMinutes()}`
  );
  const inputDate = addTaskForm.taskDate.value.replaceAll("0", "") || 0;
  const currentDate = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}`.replaceAll("0", "");

  if (inputDate === currentDate && inputTime < currentTime + 30 * 60000) {
    addFieldError(target, message.smTime);
  } else if (!inputDate || inputDate < currentDate) {
    addFieldError(target, message.getData);
    addFieldError(addTaskForm.taskDate, messages.errorEmpty);
  } else {
    addFieldSuccess(target);
  }
}

function checkOnFocus(target) {
  if (target.value.length < 1) {
    addFieldError(target, messages.errorEmpty);
  }
}

function checkOnBlur(target) {
  if (target.closest(".add-task__group").classList.contains("success")) {
    target
      .closest(".add-task__group")
      .querySelector(".form-error-msg").textContent = "";
  }
}

function checkFormSuccess(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  for (const group of allGroups) {
    if (!group.classList.contains("success")) {
      return false;
    }
  }
  return true;
}

function markFieldsWithError(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  for (const group of allGroups) {
    if (!group.classList.contains("success")) {
      group.classList.add("error");
    }
  }
}

function createTaskObj(form) {
  const taskObj = {
    id: Math.floor(Math.random() * 1000),
    text: form.taskText.value,
    dataTime: `${form.taskDate.value}T${form.taskTime.value}`,
    taskStatus: "new",
  };

  for (const checkbox of form.taskCategory) {
    if (checkbox.checked) {
      taskObj.category = checkbox.value;
    }
  }
  return taskObj;
}

function clearForm(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  formName.reset();

  for (const group of allGroups) {
    group.classList.remove("success");
  }
}

function updateLocalStorage(items) {
  localStorage.setItem("allTasks", JSON.stringify(items));
}

function removeNotification() {
  notifications.removeChild(notifications.firstElementChild);
}

function addNotification(typeNtf, textNtf) {
  notifications.insertAdjacentHTML(
    "beforeend",
    `
  <div class="notification ${typeNtf}">
    <div class="notification__text">${textNtf}</div>
  </div>
  `
  );
  if (notifications.children.length !== 0) {
    setTimeout(removeNotification, 3000);
  }
}

function getTaskNameCategory(categoryName) {
  const categories = {
    urgent: "Негайні",
    study: "Навчання",
    work: "Робота",
    hobby: "Хобі",
  };
  return categories[categoryName];
}

function getRemainingTime(dateTime) {
  const currentDate = new Date();
  const targetDate = new Date(dateTime);
  const diffInHours = Math.floor((targetDate - currentDate) / (3600 * 1000));
  const diffInMinutes = Math.floor((targetDate - currentDate) / (60 * 1000));
  if (diffInHours >= 24 * 30) {
    return `Лишилося ${Math.floor(diffInHours / (24 * 30))} міс`;
  } else if (diffInHours >= 24) {
    return `Лишилося ${Math.floor(diffInHours / 24)} дн`;
  } else if (diffInHours >= 1) {
    return `Лишилося ${diffInHours} год`;
  } else if (diffInHours >= 0) {
    return `Лишилося ${diffInMinutes} хв`;
  } else {
    return `Завдання протерміноване`;
  }
}

function addTaskOnPage(task) {
  const categoryName = getTaskNameCategory(task.category);
  const taskTime = getRemainingTime(task.dataTime);
  const expiredClass = taskTime === "Завдання протерміноване" ? "expired" : "";
  const doneClass = task.taskStatus === "done" ? task.taskStatus : "";
  const checked = task.taskStatus === "done" ? "checked" : "";

  taskList.insertAdjacentHTML(
    "beforeend",
    `
    <li class="task-list__item">
      <div class="task ${task.category} ${expiredClass} ${doneClass}">
        <div class="task__head">
            <div class="task__check">
                <input
                    class="sr-only checkbox-input"
                    type="checkbox"
                    name="${task.id}"
                    id="${task.id}"
                    ${checked}
                >
                <label for="${task.id}" class="task__checkbox checkbox"></label>
                <div class="task__name">${task.text}</div>
            </div>
            <div class="task__actions">
                <button class="btn btn--icon btn--red task__btn task__btn--remove " type="button" title="Видалити"></button>
            </div>
        </div>
        <div class="task__info">
            <div class="task__category" title="${categoryName}"></div>
            <div class="task__date">${taskTime}</div>
        </div>
      </div>
    </li>
`
  );
}

function updateTaskList() {
  taskList.innerHTML = "";
  for (const taskItem of allTaskArray) {
    addTaskOnPage(taskItem);
  }
}

function changeTaskStatus(id) {
  for (const task of allTaskArray) {
    if (task.id === +id) {
      task.taskStatus = task.taskStatus !== "done" ? "done" : "new";
      if (task.taskStatus === "done") {
        addNotification("done-task", messages.notifications.doneTask);
      }
    }
  }
  updateLocalStorage(allTaskArray);
  updateTaskList();
}

function removeTaskCard(id) {
  for (const task of allTaskArray) {
    if (task.id === +id) {
      const taskPosition = allTaskArray.indexOf(task);
      allTaskArray.splice(taskPosition, 1);
      addNotification("remove-task", messages.notifications.removeTask);
    }
  }
  updateLocalStorage(allTaskArray);
  updateTaskList();
}

function handleAddTaskBtn() {
  if (checkFormSuccess(addTaskForm, ".add-task__group")) {
    document.querySelector(".form-error").classList.remove("show");
    const newTask = createTaskObj(addTaskForm);
    allTaskArray.push(newTask);
    updateLocalStorage(allTaskArray);
    addTaskOnPage(newTask);
    clearForm(addTaskForm, ".add-task__group");
    addNotification("add-task", messages.notifications.addTask);
  } else {
    markFieldsWithError(addTaskForm, ".add-task__group");
    document.querySelector(".form-error").classList.add("show");
  }
}

document.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("task__btn--remove")) {
    const id = target.closest(".task").querySelector(".checkbox-input").id;
    removeTaskCard(id);
  }
  if (target.classList.contains("checkbox-input")) {
    changeTaskStatus(target.id);
    target.closest(".task").classList.toggle("done");
  }
  if (target.classList.contains("add-task__btn")) {
    e.preventDefault();
    handleAddTaskBtn(e);
  }
});

window.addEventListener("load", () => {
  updateTaskList();
});
