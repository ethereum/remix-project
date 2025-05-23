import React, { useState, useEffect, useRef, useContext } from 'react'
import JSZip from 'jszip'
import axios from 'axios'
import { PluginContext } from '../contexts/pluginContext'
import { CustomTooltip } from '@remix-ui/helper'
import { ImportExampleSelector } from './compile/ImportExampleSelector'
import { TargetProjectSelector } from './compile/TargetProjectSelector'
import { CompileStatusPanel } from './compile/CompileStatusPanel'
import { FileUtil } from '../utils/fileutils'
import { ModalDialog } from '@remix-ui/modal-dialog'

const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_DEV
    : process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_PROD

const WS_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_DEV
    : process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_PROD

export const Compile = () => {
  const [version] = useState('v0.85.0')
  const [projectList, setProjectList] = useState<string[]>([])
  const [targetProject, setTargetProject] = useState<string>('')
  const [compileError, setCompileError] = useState<string | null>(null)
  const [compileLogs, setCompileLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [examples, setExamples] = useState<string[]>([])
  const [exampleToImport, setExampleToImport] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const requestIdRef = useRef<string>('')
  const { plugin: client } = useContext(PluginContext)
  const [modal, setModal] = useState({ hide: true, title: '', message: '', okLabel: 'Close' })

  const showModal = (title: string, message: string) => {
    setModal({ hide: false, title, message, okLabel: 'Close' })
  }
  const hideModal = () => setModal({ ...modal, hide: true })

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/examples`)
        setExamples(res.data.examples)
      } catch {
        console.error('Failed to fetch examples')
      }
    }
    fetchExamples()
  }, [])

  useEffect(() => {
    getList()
    return () => wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.close()
  }, [])

  const generateUniqueId = () => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    const rand = Math.random().toString(36).substring(2, 8)
    return `req_${timestamp}_${rand}`
  }

  const getList = async () => {
    const projects = await getProjectHaveTomlFile('browser/aztec')
    setProjectList(projects)
    setTargetProject(projects[0] || '')
  }

  const setTarget = (e: { target: { value: string } }) => {
    setTargetProject(e.target.value)
  }

  const getProjectHaveTomlFile = async (path: string): Promise<string[]> => {
    if (!client) return []
    const projects: string[] = []
    const findTomlFileRecursively = async (currentPath: string): Promise<void> => {
      const list = await client.call('fileManager', 'readdir', currentPath);
      const hasTomlFile = Object.keys(list).some((item) => item.endsWith('Nargo.toml'))
      if (hasTomlFile) {
        projects.push(currentPath.replace('browser/', ''))
      }
      for (const [key, value] of Object.entries(list)) {
        if ((value as any).isDirectory) {
          const additionalPath = key.split('/').pop()
          await findTomlFileRecursively(currentPath + '/' + additionalPath)
        }
      }
    }
    await findTomlFileRecursively(path)
    return projects
  }

  const getAllProjectFiles = async (projectPath: string) => {
    const files = await FileUtil.allFilesForBrowser(client, projectPath)
    return files.filter((file) => !file.path.startsWith(`${projectPath}/target`))
  }

  const generateZip = async (files: any[], projectPath: string) => {
    const zip = new JSZip()
    await Promise.all(
      files.map(async (file) => {
        if (!file.isDirectory) {
          const content = await client.call('fileManager', 'readFile', file.path);
          const relativePath = file.path.replace('browser/', '')
          const zipPath = relativePath.replace(`${projectPath}/`, '')
          zip.file(zipPath, content)
        }
      })
    )
    return zip.generateAsync({ type: 'blob' })
  }

  const handleCompile = async () => {
    if (!targetProject) {
      showModal('Error', 'No target project selected!')
      return
    }

    setLoading(true)
    setCompileLogs([])
    requestIdRef.current = generateUniqueId()

    const ws = new WebSocket(`${WS_URL}`)
    wsRef.current = ws

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ requestId: requestIdRef.current }))
        resolve()
      }
      ws.onerror = (error) => {
        console.error('[Frontend] WebSocket connection error:', error)
        reject(new Error('WebSocket connection failed'))
      }
    })

    ws.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (parsed.logMsg) {
          setCompileLogs((prev) => [...prev, parsed.logMsg])
          await client.call('terminal', 'log', {
            type: 'info',
            value: parsed.logMsg
          })
        }
      } catch (e) {
        console.warn('[Frontend] Invalid WebSocket message:', event.data)
      }
    }

    ws.onerror = () => {
      showModal('Error', 'WebSocket connection failed')
      setLoading(false)
    }

    try {
      const projFiles = await getAllProjectFiles(targetProject)
      const zipBlob = await generateZip(projFiles, targetProject)

      const formData = new FormData()
      formData.append('file', zipBlob, `${targetProject}.zip`)
      formData.append('projectPath', targetProject)

      const response = await axios.post(
        `${BASE_URL}/compile?requestId=${requestIdRef.current}`,
        formData
      )

      if (!response.data || !response.data.url) {
        throw new Error('S3 URL not returned from backend')
      }

      const zipResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' })
      const compiledZip = await JSZip.loadAsync(zipResponse.data)

      await Promise.all(
        Object.entries(compiledZip.files).map(async ([path, file]) => {
          if (!file.dir) {
            const content = await file.async('string')
            const remixPath = `browser/${targetProject}/${path}`
            await client.call('fileManager', 'writeFile', remixPath, content)
          }
        })
      )

      await client.call('terminal', 'log', {
        type: 'info',
        value: 'Compilation completed!'
      })
      showModal('Success', `Compilation completed! JSON generated under ${targetProject}/target`)
    } catch (error: any) {
      showModal('Error', `Compilation failed: ${error.message}`)
      await client.call('terminal', 'log', {
        type: 'error',
        value: `Compilation failed: ${error.message}`
      })
    } finally {
      setLoading(false)
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }

  const checkQueueStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/queue/status`, {
        params: { requestId: requestIdRef.current },
      })
      setQueuePosition(res.data.position)
    } catch (err) {
      console.warn('Failed to check queue status', err)
    }
  }

  const importExample = async (exampleName: string) => {
    if (!client) return
    const targetPath = `browser/aztec/${exampleName}`

    try {
      const existing = await client.call('fileManager', 'readdir', targetPath)
      if (Object.keys(existing).length > 0) {
        await client.call('terminal', 'log', {
          type: 'warn',
          value: `⚠️ Project "${exampleName}" already exists. Import canceled.`
        })
        return
      }
    } catch (err) {}

    try {
      const res = await axios.get(`${BASE_URL}/examples/url`, {
        params: { name: exampleName },
      })

      if (!res.data.url) throw new Error('No download URL received')

      const zipRes = await axios.get(res.data.url, { responseType: 'arraybuffer' })
      const zip = await JSZip.loadAsync(zipRes.data)
      const rootFolder = Object.keys(zip.files)[0]?.split('/')[0]

      await Promise.all(
        Object.entries(zip.files).map(async ([zipPath, file]) => {
          if (!file.dir && zipPath.startsWith(`${rootFolder}/`)) {
            const relativePath = zipPath.replace(`${rootFolder}/`, '')
            const remixPath = `${targetPath}/${relativePath}`
            const content = await file.async('string')
            await client.call('fileManager', 'writeFile', remixPath, content)
          }
        })
      )

      await client.call('terminal', 'log', {
        type: 'info',
        value: `Example "${exampleName}" imported.`
      })
      
      setTargetProject(`aztec/${exampleName}`)
      await getList()
    } catch (err: any) {
      console.error(`Failed to import example ${exampleName}`, err)
      await client.call('terminal', 'log', {
        type: 'error',
        value: `Failed to import ${exampleName}: ${err.message}`
      })
    }
  }

  return (
  <>
    <div className="remixui_panel mb-3">
      <div className="compiler-version">
        <span className="compiler-version-label">Compiler Version:</span>
        <span className="compiler-version-value">{version}</span>
      </div>
      <div className="remixui_panelBody px-4 pt-0">
        <ImportExampleSelector
          examples={examples}
          exampleToImport={exampleToImport}
          setExampleToImport={setExampleToImport}
          importExample={importExample}
        />
        <TargetProjectSelector
          projectList={projectList}
          targetProject={targetProject}
          setTarget={(e) => setTargetProject(e.target.value)}
          onReload={getList}
        />
        <button
          className="btn btn-primary btn-block mt-3"
          disabled={!targetProject || loading}
          onClick={handleCompile}
        >
          {loading && <i className="fas fa-sync fa-spin mr-2"></i>}
          {loading ? 'Compiling...' : 'Compile'}
        </button>
        <CompileStatusPanel
          loading={loading}
          queuePosition={queuePosition}
          checkQueueStatus={checkQueueStatus}
        />
      </div>
    </div>
    <ModalDialog id="compileModal" title={modal.title} message={modal.message} hide={modal.hide} okLabel={modal.okLabel} okFn={hideModal} handleHide={hideModal} />
  </>
  )
}
