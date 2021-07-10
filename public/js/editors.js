let table = document.getElementById('orders-table');

async function getEditorsAndJournals() {
  let editorsJSON = await fetch('/getEditors');
  let editors = await editorsJSON.json();
  let journalsJSON = await fetch('/getJournals');
  let journals = await journalsJSON.json();
  
  for (let i = 0; i < editors.length; i++) {
    table.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${editors[i].username}</td>
        <td>${journals[i].model} ${journals[i].number}</td>
        <td>${editors[i].isBusy ? "Да" : "Нет"}</td>
      </tr>
    `);
  }
  
}

getEditorsAndJournals();