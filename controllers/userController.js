const express = require("express");

const fs = require("fs");


let usersData = JSON.parse(fs.readFileSync("./dev-data/data/users.json","utf-8"));


exports.getAllUsers = (req,res)=>{
    res.json({status:"succes", usersData});
}


exports.getUserById = (req,res)=>{
    let id= req.params.id;
    let user = usersData.find((user) => user.id === parseInt(id));

    if(!user)
        res.status(400).json({message:"Not found"});
    else
    res.status(200).json({user});
}

exports.updateUserById = (req,res)=>{
    let id = req.params.id;
    let userUpdates = req.body;

    let user = usersData.find((user) => user.id === parseInt(id));

    if(!user)
    res.status(400).json({message:"Not found"});
    else
    res.status(201).json({...user, userUpdates});

    
}

exports.deleteUser = (req,res)=>{
    let id = req.params.id;

    res.status(201).json({message:"User Deleted"});
}
