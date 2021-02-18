// const useStyles = createStyles(theme => makeStyles({
//   butthole: {
//     fontSize: "80px",
//     position: "relative",
//     "&:hover" : {
//       fontSize: "40px"
//     }
//   }
// }));

// const myComp = ({}) => {
//   const classes = useStyles();
//   const x = 10;
//   const myArr = [a, b, c, d];

//   return (
//     <div>
//       <h1 className={classes.butthole}>I'm a butthole {x}</h1>
//       {mrArr.mqp((letter, i) => {
//         const letterPlusIndex = `${letter}${i}`;
//         return (
//           <h1>{letterPlusIndex}</h1>
//         )
//       })}
//     </div>
//   );
// };

var tasks = {};

let auditTask = function (taskEl) {
  // get date from task element
  let date = $(taskEl).find("span").text().trim();

  // ensure it worked
  console.log(date);

  // convert to moment object at 5:00 pm
  let time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// enable draggable/sortable feature on list-group elements
$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    // console.log(ui);
  },
  deactivate: function (event, ui) {
    // console.log(ui);
  },
  over: function (event) {
    //  console.log(event);
  },
  out: function (event) {
    //  console.log(event);
  },
  update: function () {
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        // save values in temp array
        tempArr.push({
          text: $(this).find("p").text().trim(),
          date: $(this).find("span").text().trim(),
        });
      });

    // trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  },
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  },
});

$("#modalDueDate").datepicker({
  minDate: 1,
});

$(".list-group").on("click", "p", function () {
  let text = $(this).text().trim();

  let textInput = $("<textarea>").addClass("form-control").val(text);

  $(this).replaceWith(textInput);

  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function () {
  // get current value of textarea
  let text = $(this).val();

  // get status type and position in the list
  let status = $(this).closest(".list-group").attr("id").replace("list-", "");
  let index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  let taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with new content
  $(this).replaceWith(taskP);
});

//due date was clicked
$(".list-group").on("click", "span", function () {
  //get current text
  let date = $(this).text().trim();

  //create new input element
  let dataInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dataInput);

  // enable jquery ui datepicker
  dataInput.datepicker({
    minDate: 1,
    onClose: function () {
      // when calendar is closed, force a "change" event on the `dateInput
      $(this).trigger("change");
    },
  });

  //automatically focus on new element
  dataInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);

  //pass task's <li> element into auditTaask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();
