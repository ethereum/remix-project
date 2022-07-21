import React from "react"
import { fileDecoration } from "../types"

export const getComments = function (fileDecoration: fileDecoration) {
<<<<<<< HEAD
    if(fileDecoration.comment){
        const comments = Array.isArray(fileDecoration.comment) ? fileDecoration.comment : [fileDecoration.comment]
        return comments.map((comment, index) => {
=======
    if(fileDecoration.commment){
        const commments = Array.isArray(fileDecoration.commment) ? fileDecoration.commment : [fileDecoration.commment]
        return commments.map((comment, index) => {
>>>>>>> 43bc1038a (add test)
            return <div key={index}>{comment}<br></br></div>
        })
    }
}