let select = document.getElementById('editor_id');
let select_del = document.getElementById('editor_id_delete');

async function getEditorsAndJournals() {
  let editorsJSON = await fetch('/getEditors');
  let editors = await editorsJSON.json();
  
  for (let i = 0; i < editors.length; i++) {
    select.insertAdjacentHTML('beforeend', `
      <option value="${editors[i].id}">${editors[i].username}</option>
    `);
    select_del.insertAdjacentHTML('beforeend', `
      <option value="${editors[i].id}">${editors[i].username}</option>
    `);
  }
  
}

getEditorsAndJournals();