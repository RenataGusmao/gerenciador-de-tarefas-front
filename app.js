const API_URL = 'https://gerenciador-de-tarefas-qg6m.onrender.com';

const form = document.getElementById('task-form');
const taskId = document.getElementById('task-id');
const title = document.getElementById('title');
const status = document.getElementById('status');
const category = document.getElementById('category');
const tasksList = document.getElementById('tasks-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const reloadBtn = document.getElementById('reload-btn');

function showMessage(text) {
  message.textContent = text;
}

function clearForm() {
  form.reset();
  taskId.value = '';
  formTitle.textContent = 'Nova tarefa';
  cancelEdit.classList.add('hidden');
}

async function loadTasks() {
  const response = await fetch(API_URL);
  const tasks = await response.json();

  if (!tasks.length) {
    tasksList.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
    return;
  }

  tasksList.innerHTML = tasks.map(task => `
    <div class="entry-item">
      <h3>${task.title}</h3>
      <p>Status: ${task.status}</p>
      <p>Categoria: ${task.category}</p>
      <div class="entry-buttons">
        <button onclick="editTask('${task._id}')">Editar</button>
        <button onclick="deleteTask('${task._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function saveTask(data) {
  const id = taskId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

window.editTask = async function (id) {
  const response = await fetch(`${API_URL}/${id}`);
  const task = await response.json();

  taskId.value = task._id;
  title.value = task.title;
  status.value = task.status;
  category.value = task.category;

  formTitle.textContent = 'Editar tarefa';
  cancelEdit.classList.remove('hidden');
  showMessage('Editando tarefa.');
};

window.deleteTask = async function (id) {
  if (!confirm('Deseja excluir esta tarefa?')) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  showMessage('Tarefa excluída.');
  loadTasks();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: title.value,
    status: status.value,
    category: category.value
  };

  await saveTask(data);
  showMessage(taskId.value ? 'Tarefa atualizada.' : 'Tarefa criada.');
  clearForm();
  loadTasks();
});

cancelEdit.addEventListener('click', () => {
  clearForm();
  showMessage('Edição cancelada.');
});

reloadBtn.addEventListener('click', loadTasks);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  });
}

clearForm();
loadTasks();