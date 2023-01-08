import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { getFilesByStatus, getFileStatusForFile, getFilesWithNotModifiedStatus } from '../../lib/fileHelpers'
import { gitActionsContext, pluginActionsContext } from '../../state/context'
import { gitPluginContext } from '../gitui'
import { faUndo, faPlus, faMinus, faSync, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import path from 'path'
import { commitChange, fileStatusResult } from '../../types'

export const SourceControl = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)
    const pluginactions = React.useContext(pluginActionsContext)
    const [show, setShow] = useState(false)


    useEffect(() => {
        if (context.fileStatusResult) {
            console.log(context)
            const total = context.allchangesnotstaged.length
            const badges = total + context.staged.length
            pluginactions.statusChanged(badges)
            console.log("allchangesnotstaged", context.allchangesnotstaged)
            setShow((context.deleted.length > 0 || context.staged.length > 0 || context.untracked.length > 0 || context.modified.length > 0))
        }
    }, [context.fileStatusResult])

    function RenderGroups() {
        //const groups = [{name:'Staged', group: staged}, {name:'Untracked',group:untracked},{name:'Modified', group:modified},{name:'Deleted', group:deleted}]
        const groups = [{ name: 'Staged', group: context.staged }, { name: 'Changes', group: context.allchangesnotstaged }]
        return (<>
            {
                groups.map((ob: any, index: number) => {
                    return (
                        <div key={`h${index}`}>
                            {ob.group && ob.group.length > 0 ? <h5 className='mb-3 mt-3'>{ob.name}</h5> : <></>}
                            <RenderFiles Files={ob.group} Type={ob.name}></RenderFiles>
                        </div>
                    )
                })
            }

        </>)
    }

    async function fileClick(file: fileStatusResult) {
        console.log(file)
        //let status = fileservice.getFileStatusForFile(file.filename || "");
        if (file.statusNames && file.statusNames.indexOf("modified") !== -1) {
            const headHash = await actions.resolveRef("HEAD")
            const change: commitChange = {
                path: file.filename,
                type: "modified",
                hashOriginal: headHash,
                hashModified: ''
            }

            await actions.diff(change)
            console.log("diff", change)

        } else {
            await pluginactions.openFile(file.filename)
            //await client.call('fileManager', 'open', file.filename)
        }
    }

    function RenderFiles(ob: any) {
        if (!ob.Files) return <></>
        return (<>
            {
                ob.Files.map((file: any, index: number) => {
                    return (
                        <div key={`h${index}`}>
                            <Row className='mb-1'>
                                <Col className='col-8'>
                                    <div className='pointer text-truncate' onClick={async () => await fileClick(file)}>
                                        <span data-id={`file${ob.Type}${path.basename(file.filename)}`} className='font-weight-bold'>{path.basename(file.filename)}</span>
                                        <div className='text-secondary'> {file.filename}</div>
                                    </div>
                                </Col>
                                <Col className='col-4 p-0'>
                                    <Row>
                                        <RenderButtons File={file} Type={ob.Type}></RenderButtons>
                                    </Row>
                                </Col>
                            </Row>


                        </div>
                    )
                })
            }
        </>)
    }

    function FunctionStatusIcons(ob: any) {
        const status = ob.status
        return (<>
            <Col className='col-2 p-0'>
                {status && status.indexOf("modified") === -1 ? <></> : <button className='btn btn-sm mr-1'>M</button>}
                {status && status.indexOf("untracked") === -1 ? <></> : <button className='btn btn-sm  mr-1'>U</button>}
                {status && status.indexOf("deleted") === -1 ? <></> : <button className='btn btn-sm  mr-1'>D</button>}
                {status && status.indexOf("added") === -1 ? <></> : <button className='btn btn-sm  mr-1'>U</button>}
            </Col>
        </>)
    }


    function RenderButtons(ob: any) {
        const status = getFileStatusForFile(ob.File.filename || "", context.fileStatusResult);
        if (ob.Type === 'Untracked') {
            return <>
                <button onClick={async () => await actions.add(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>
            </>
        }
        if (ob.Type === 'Staged') {
            return <>
                <Col className='col-8 p-0'>
                    {status && status.indexOf("modified") === -1 ? <></> : <button onClick={async () => await actions.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button>}
                    {status && status.indexOf("deleted") === -1 ? <></> : <button onClick={async () => await actions.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button>}

                    {status && status.indexOf("deleted") !== -1 ? <></> : <button data-id={`unStage${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await actions.rm(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faMinus} className="" /></button>}
                </Col>
                <FunctionStatusIcons status={status} />

            </>
        }
        if (ob.Type === 'Modified') {
            return <>
                {status && status.indexOf("staged") !== -1 ? <></> : <button onClick={async () => await actions.add(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
                <button onClick={async () => await actions.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faUndo} className="" /></button>
            </>
        }
        if (ob.Type === 'Deleted') {
            return <>
                {status && status.indexOf("staged") !== -1 ? <></> : <button onClick={async () => await actions.rm(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
            </>
        }
        if (ob.Type === 'Changes') {
            return <>
                <Col className='col-8 p-0'>
                    {status && status.indexOf("deleted") === -1 ? <></> : <><button onClick={async () => await actions.checkoutfile(ob.File.filename)} data-id={`undo${ob.Type}${path.basename(ob.File.filename)}`} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button><button data-id={`addToGit${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await actions.rm(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faPlus} className="" /></button></>}
                    {status && status.indexOf("modified") === -1 ? <></> : <button onClick={async () => await actions.checkoutfile(ob.File.filename)} data-id={`undo${ob.Type}${path.basename(ob.File.filename)}`} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button>}
                    {(status && status.indexOf("unstaged") !== -1 || status && status.indexOf("deleted") !== -1) ? <></> : <button data-id={`addToGit${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await actions.add(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faPlus} className="" /></button>}
                    {(status && status.indexOf("unstaged") !== -1 && status && status.indexOf("modified") !== -1) ? <button data-id={`addToGit${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await actions.add(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faPlus} className="" /></button> : <></>}
                </Col>
                <FunctionStatusIcons status={status} />
            </>
        }
        return <></>
    }

    return (
        <>
            {show ?
                <>
                    <div>
                        <button data-id='stageAll' onClick={async () => await actions.addall()} className='btn btn-sm btn-primary'>Stage all</button>
                        <hr></hr>
                        <RenderGroups></RenderGroups>
                    </div></>
                : <>Nothing to commit

                </>}
        </>
    );

}