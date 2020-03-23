"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer  = require("multer");

const app = express();

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
app.use(multer({storage:storageConfig}).single("filedata"));

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));


app.get("/tasks", function (request, response) {
    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    response.send(tasks);
});

app.get("/tasks/:id", function (request, response) {
    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    let id = request.params.id;
    let task = null;
    for (let i = 0; i < tasks.length; i++) {
        if (id == tasks[i].id) {
            task = tasks[i];
            break;
        }
    }

    if (task) {
        response.send(task);
    } else {
        response.sendStatus(404);
    }
});

app.get("/tasks/filter/:status", function (request, response) {
    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    let status = request.params.status;
    let reqTasks = [];

    for (let i = 0; i < tasks.length; i++) {
        if (status == tasks[i].status) {
            reqTasks.push(tasks[i]);
        }
    }
    response.send(reqTasks);
});

app.put("/tasks", function (request, response) {
    if (!request.body) return response.sendStatus(400);

    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    let task = null;

    for (let i = 0; i < tasks.length; i++) {
        if (request.body.id == tasks[i].id) {
            task = tasks[i];
            break;
        }
    }

    if (task) {
        task.name = request.body.name;
        task.file = request.file;
        task.date = request.body.date;
        task.status = request.body.status;
        let data = JSON.stringify(tasks);
        fs.writeFileSync("tasks.json", data);
        response.send(task);
    } else {
        response.sendStatus(404);
    }
});

app.post("/tasks", function (request, response) {
    
    if (!request.body) return response.sendStatus(400);

    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    // находим максимальный id
    let maxId = Math.max.apply(Math, tasks.map(function (o) {
        return o.id;
    }));

    let task = {
        id: maxId + 1,
        name: request.body.name,
        file: request.file,
        date: request.body.date,
        status: request.body.status
    };

    tasks.push(task);
    let data = JSON.stringify(tasks);
    fs.writeFileSync("tasks.json", data);
    response.send(task);
});

app.delete("/tasks/:id", function (request, response) {
    let content = fs.readFileSync("tasks.json", "utf8");
    let tasks = JSON.parse(content);
    let id = request.params.id;
    let index = -1;

    for (let i = 0; i < tasks.length; i++) {
        if (id == tasks[i].id) {
            index = i;
            break;
        }
    }

    if (index > -1) {
        let task = tasks.splice(index, 1)[0];
        let data = JSON.stringify(tasks);
        fs.writeFileSync("tasks.json", data);
        response.send(task);
    } else {
        response.sendStatus(404);
    }

});


app.listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});