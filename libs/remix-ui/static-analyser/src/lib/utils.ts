

// export default Object.filter = (obj, predicate) =>
//     Object.keys(obj)
//         .filter(key => predicate(obj[key]))
//         .reduce((res, key) => (res[key] = obj[key], res), {})


const checkIfElementExist = (index, arr) => {
    if (!arr.includes(index)) {          //checking weather array contain the index
        arr.push(index)               //adding to array because value doesnt exists
    } else {
        arr.splice(arr.indexOf(index), 1)  //deleting
    }
    return arr
}

export { checkIfElementExist }
