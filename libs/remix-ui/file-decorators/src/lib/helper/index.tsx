import React from "react"
import { fileDecoration } from "../types"

export const getComments = function (fileDecoration: fileDecoration) {
    if(fileDecoration.commment){
        const commments = Array.isArray(fileDecoration.commment) ? fileDecoration.commment : [fileDecoration.commment]
        return commments.map((comment, index) => {
            return <div key={index}>{comment}<br></br></div>
        })
    }
}