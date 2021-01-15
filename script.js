/************************
 * links
 * trees image - pexels
 * {@link} - https://www.pexels.com/photo/photo-of-trees-in-forest-3801030/ 
 * {@link} - https://css-tricks.com/the-current-state-of-styling-scrollbars/
 * {@link} - https://www.w3schools.com/html/html5_draganddrop.asp
 * {@link} - https://www.w3schools.com/tags/att_ondragenter.asp
 * {@link} - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
 * {@link} - https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content
 * {@link} - https://developer.mozilla.org/en-US/docs/Web/API/Element/focusout_event
 * {@link} - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 * {@link} - https://stackoverflow.com/questions/29640254/when-why-to-use-map-reduce-over-for-loops
 *
 ************************/

const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// item lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogListEl = document.getElementById('backlog-list');
const progressListEl = document.getElementById('progress-list');
const completeListEl = document.getElementById('complete-list');
const onHoldListEl = document.getElementById('on-hold-list');

// items
let updatedOnLoad = false;

// initialize arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// drag functionality
let draggedItem;
let dragging = false;
let currentColumn;

// get arrays from local storage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['release the course', 'sit back and relax'];
    progressListArray = ['work on projects', 'listen to music'];
    completeListArray = ['being cool', 'getting stuff done'];
    onHoldListArray = ['being uncool'];
  }
}

// set localstorage arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  });
}

// filter array to remove empty values
function filterArray(array) {
  const filteredArray = array.filter(item => item !== null);
  return filteredArray;
}

// create dom elements for each list item
function createItemEl(columnEl, column, item, index) {
  // list item
  const listEl = document.createElement('li');
  listEl.textContent = item;
  listEl.id = index;
  listEl.classList.add('drag-item');
  listEl.draggable = true;
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`);
  listEl.setAttribute('ondragstart', 'drag(event)');
  listEl.contentEditable = true;
  // append
  columnEl.appendChild(listEl);
}

// update columns in dom - reset html, filter array, update local storage
function updateDOM() {
  // check local storage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // backlog column
  backlogListEl.textContent = '';
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogListEl, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  // progress column
  progressListEl.textContent = '';
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressListEl, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  // complete column
  completeListEl.textContent = '';
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeListEl, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  // on hold column
  onHoldListEl.textContent = '';
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldListEl, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
  // don't run more than once, update localstorage
  updatedOnLoad = true;
  updateSavedColumns();
}

// update item - delete if necessary, or update array value
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  const selectedColumn = listColumns[column].children;
  if (!dragging) {
    if (!selectedColumn[id].textContent) {
      delete selectedArray[id];
    } else {
      selectedArray[id] = selectedColumn[id].textContent;
    }
    updateDOM();
  }
}

// add to column list, reset textbox
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = '';
  updateDOM(column);
}

// show add item input box
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden';
  saveItemBtns[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

// hide item input box
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  addToColumn(column);
}

// allows arrays to reflect drag and drop items
function rebuildArrays() {
  //  console.log(backlogListEl.children)
  backlogListArray = Array.from(backlogListEl.children).map(i => i.textContent);
  progressListArray = Array.from(progressListEl.children).map(i => i.textContent);
  completeListArray = Array.from(completeListEl.children).map(i => i.textContent);
  onHoldListArray = Array.from(onHoldListEl.children).map(i => i.textContent);

  updateDOM();
}

// when item enters column area
function dragEnter(column) {
  listColumns[column].classList.add('over');
  currentColumn = column;
}

// when item starts dragging
function drag(e) {
  draggedItem = e.target;
  dragging = true;
}

// column allows for item to drop
function allowDrop(e) {
  e.preventDefault();
}

// dropping item in column
function drop(e) {
  e.preventDefault();
  const parent = listColumns[currentColumn];
  // remove background color/padding
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });
  // add item to column
  parent.appendChild(draggedItem);
  // dragging complete
  dragging = false;
  rebuildArrays();
}

// on load
updateDOM();
