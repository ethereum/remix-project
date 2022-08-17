import React from "react"
import { fileDecoration } from "../types"

export const getComments = function (fileDecoration: fileDecoration) {
    if(fileDecoration.comment){
        const comments = Array.isArray(fileDecoration.comment) ? fileDecoration.comment : [fileDecoration.comment]
        return comments.map((comment, index) => {
            return <div key={index}>{comment}<br></br></div>
        })
    }
}