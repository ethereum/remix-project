import React, { useState, useEffect } from 'react'
import { ExtractData, ExtractFunc } from '../types'

export const useExtractData = (json, extractFunc?): Array<{ [key: string]: ExtractData }> => {
    const [data, setData] = useState(null)
    const extractDataDefault = (item, parent?) => {
        const ret: ExtractData = {}

        if (item instanceof Array) {
            ret.children = item.map((item, index) => {
            return {key: index, value: item}
            })
            ret.self = 'Array'
            ret.isNode = true
            ret.isLeaf = false
        } else if (item instanceof Object) {
            ret.children = Object.keys(item).map((key) => {
            return {key: key, value: item[key]}
            })
            ret.self = 'Object'
            ret.isNode = true
            ret.isLeaf = false
        } else {
            ret.self = item
            ret.children = null
            ret.isNode = false
            ret.isLeaf = true
        }
        return ret
    }

    useEffect(() => {
        const data: Array<{ [key: string]: ExtractData }> = Object.keys(json).map((innerKey) => {
            if (extractFunc) {
                return { [innerKey]: extractFunc(json[innerKey], json) }
            } else {
                return { [innerKey]: extractDataDefault(json[innerKey], json) }
            }
        })

        setData(data)

        return () => {
            setData(null)
        }
    }, [json, extractFunc])

    return data
}

export default useExtractData