import { useState, useEffect, useRef, useContext } from 'react'
import { Collapse, Button, Card, Form, Alert, Spinner, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import JSZip from 'jszip'
import axios from 'axios'
import { PluginContext } from '../contexts/pluginContext'
import { ImportExampleSelector } from './compile/ImportExampleSelector'
import { TargetProjectSelector } from './compile/TargetProjectSelector'
import { CompileStatusPanel } from './compile/CompileStatusPanel'
import { FileUtil } from '../utils/fileutils'

const BASE_URL = process.env.AZTEC_PLUGIN_API_BASE_URL
const WS_URL = process.env.AZTEC_PLUGIN_WS_URL

export const Compile = () => {
  const [openCompile, setOpenCompile] = useState(false)
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

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/examples`)
        setExamples(res.data.examples)
      } catch (err) {
        console.error('Failed to fetch examples', err)
      }
    }
    fetchExamples()
  }, [])

  useEffect(() => {
    getList()
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
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
      await client.call('terminal', 'log', {
        type: 'error',
        value: 'No target project selected!'
      })
      setCompileError('No target project selected!')
      return
    }

    setLoading(true)
    setCompileError(null)
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
      setCompileError('WebSocket connection failed.')
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
        value: '✅ Compilation completed!'
      })
    } catch (error: any) {
      setCompileError(`Compilation failed: ${error.message}`)
      await client.call('terminal', 'log', {
        type: 'error',
        value: `❌ Compilation failed: ${error.message}`
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
        value: `✅ Example "${exampleName}" imported.`
      })
      
      setTargetProject(`aztec/${exampleName}`)
      await getList()
    } catch (err: any) {
      console.error(`Failed to import example ${exampleName}`, err)
      await client.call('terminal', 'log', {
        type: 'error',
        value: `❌ Failed to import ${exampleName}: ${err.message}`
      })
    }
  }

  return (
    <Card className="mb-3">
      <Card.Header
        onClick={() => setOpenCompile(!openCompile)}
        aria-controls="compile-collapse"
        aria-expanded={openCompile}
        className="d-flex align-items-center justify-content-between"
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">Compile Aztec Project</div>
      </Card.Header>
      <Collapse in={openCompile}>
        <div id="compile-collapse" style={{ transition: 'height 0.3s ease-in-out', overflow: 'hidden' }}>
          <Card.Body>
            <Form>
              <ImportExampleSelector
                examples={examples}
                exampleToImport={exampleToImport}
                setExampleToImport={setExampleToImport}
                importExample={importExample}
              />
              <TargetProjectSelector
                projectList={projectList}
                targetProject={targetProject}
                setTarget={setTarget}
                onReload={getList}
              />
              <Button
                variant="primary"
                className="w-100 mt-3"
                disabled={!targetProject || loading}
                onClick={handleCompile}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Compiling...
                  </>
                ) : (
                  'Compile'
                )}
              </Button>
              <CompileStatusPanel
                loading={loading}
                queuePosition={queuePosition}
                checkQueueStatus={checkQueueStatus}
              />
              {compileError && (
                <Alert variant="danger" className="mt-2" style={{
                  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: '12px',
                }}>
                  {compileError}
                </Alert>
              )}
            </Form>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  )
}
