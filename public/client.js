"use strict";

function GetTasks() {
    $.ajax({
        url: "/tasks/",
        type: "GET",
        contentType: "application/json",
        success: function (tasks) {
            let rows = "";
            $.each(tasks, function (index, task) {
                rows += createRow(task);
            });
            $("table tbody").empty();
            $("table tbody").append(rows);
        }
    });
}

function DeleteTask(id) {
    $.ajax({
        url: "/tasks/" + id,
        contentType: "application/json",
        method: "DELETE",
        success: function (task) {
            $("tr[data-rowid='" + task.id + "']").remove();
        }
    });
}

function GetTask(id) {
    $.ajax({
        url: "/tasks/" + id,
        contentType: "application/json",
        method: "GET",
        success: function (task) {
            let form = document.forms.taskForm;
            form.elements.id.value = task.id;
            form.elements.name.value = task.name;
            console.log(task.file);
            form.elements.files = task.file;
            form.elements.date.value = task.date;
            form.elements.status.value = task.status;
        }
    });
}

function EditTask(data) {
    $.ajax({
        url: "/tasks",
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: "PUT",
        success: function (task) {
            resetTaskForm();
            $("tr[data-rowid='" + task.id + "']").replaceWith(createRow(task));
        }
    });
}

function CreateTask(data) {
    $.ajax({
        url: "/tasks",
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: function (task) {
            resetTaskForm();
            $("table tbody").append(createRow(task));
        }
    });
}

function FilterByStatus(status) {
    $.ajax({
        url: "/tasks/filter/" + status,
        contentType: "application/json",
        method: "GET",
        success: function (tasks) {
            let rows = "";
            $.each(tasks, function (index, task) {
                rows += createRow(task);
            });
            $("table tbody").empty();
            $("table tbody").append(rows);
        }
    });
}

let createRow = function (task) {
    let filename = "";
    if (task.file) filename = task.file.originalname;
    let row = "<tr ";
    if (task.status == "completed")
        row += "class='table-success' ";
    else if (task.status == "expired")
        row += "class='table-danger' ";
    row += "data-rowid='" + task.id + "'><td>" + task.id + "</td>" +
        "<td>" + task.name + "</td> <td>" + task.date + "</td>" +
        "<td>" + task.status + "</td>" +
        "<td><a href='" + filename + "'>" + filename + "</a></td>" +
        "<td><button id='editBtn' type='button' class='btn btn-sm btn-outline-dark bg-light' data-id='" +
        task.id +
        "'>Edit</button>  " +
        "<button id='deleteBtn' type='button' class='btn btn-sm btn-outline-dark bg-light' data-id='" +
        task.id +
        "'>Delete</button></td></tr>";
    return row;
};

$("#taskForm").submit(function (e) {
    e.preventDefault();
    let id = this.elements.id.value;
    let name = this.elements.name.value;
    let date = this.elements.date.value;

    let data = new FormData(this);

    if (!name || !date) alert("Error! Fill in all the fields!");
    else if (id == 0)
        CreateTask(data);     
    else {
        EditTask(data);
        $('#formTitle').text('New Task:');
    }
});


$("#filterForm").submit(function (e) {
    e.preventDefault();
    let status = this.elements.status.value;
    if (status == "all") GetTasks();
    else FilterByStatus(status);
});

$("table").on("click", "#editBtn", function () {
    $('#formTitle').text('Edit Task:');
    let id = $(this).data("id");
    GetTask(id);
});

$("table").on("click", "#deleteBtn", function () {
    let id = $(this).data("id");
    DeleteTask(id);
});

$('#resetBtn').on('click', function(){
    resetTaskForm();
});

function resetTaskForm() {
    let form = document.forms.taskForm;
    form.reset();
    form.elements.id.value = 0;
    $('#formTitle').text('New Task:');
}

GetTasks();