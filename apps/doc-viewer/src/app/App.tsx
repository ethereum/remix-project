import React, {Dispatch, SetStateAction, useEffect, useState, useRef} from 'react'
import {DocViewer} from './docviewer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import copy from 'copy-to-clipboard'
import './markdown.css'

const client = new DocViewer()

export default function App() {
  const isInit = useRef(false)
  const [contents, setContents] = useState('')
  const [theme, setTheme] = useState<string>('')
  const [btnColor, setBtnColor] = useState<string>('')

  useEffect(() => {
    client.eventEmitter.on('contentsReady', (fileContents: string) => {
      setContents(fileContents)
      if (isInit.current) return
      client.call('theme', 'currentTheme' as any).then((t: any) => setTheme(t?.name || ''))
      client.on('theme', 'themeChanged' as any, (t: any) => setTheme(t?.name || ''))
      isInit.current = true      
    })
  }, [])

  const edit = () => {
    if (!client.mdFile) return
    client.call('fileManager', 'open' as any, client.mdFile)
    client.call('fileManager', 'switchFile' as any, client.mdFile)
  }

  return (
    <div className="p-3 bg-body text-body" data-theme={theme.toLowerCase()}>
      <button className="btn btn-sm border mb-2" onClick={edit}>EDIT</button>
      <div className="aiMarkup lh-base text-wrap d-flex flex-column gap-2">
        {RemixMarkdownViewer(theme, contents, btnColor, setBtnColor)}
      </div>
    </div>
  )
}

function RemixMarkdownViewer(theme: string, markDownContent: string, btnColor: string, setBtnColor: Dispatch<SetStateAction<string>>): React.ReactNode {
  return <ReactMarkdown
    remarkPlugins={[[remarkGfm, {}]]}
    rehypePlugins={[rehypeRaw, rehypeSanitize]}
    linkTarget="_blank"
    components={{
      code({ node, inline, className, children, ...props }) {
        const text = String(children).replace(/\n$/, '')
        const match = /language-(\w+)/.exec(className || '')
        const language = match ? match[1] : ''
        if (inline) {
          return (
            <code className="ai-inline-code" {...props}>
              {text}
            </code>
          )
        }
        return (
          <div className="ai-code-block-wrapper">
            {language && (
              <div className={`ai-code-header ${theme === 'Dark' ? 'text-white' : 'text-dark'}`}>
                <span className="ai-code-language">{language}</span>
                <button
                  type="button"
                  className={`btn btn-sm ${btnColor.length > 0 ? 'btn-outline-success border border-success' : 'btn-outline-info border border-info'}`}
                  onClick={() => {
                    setBtnColor('successfulCopy')
                    copy(text)
                    setTimeout(() => setBtnColor(''), 2000)
                  }}
                >
                  <i className="fa-regular fa-copy"></i>
                </button>
              </div>
            )}
            {!language && (
              <button
                type="button"
                className="ai-copy-btn ai-copy-btn-absolute"
                onClick={() => copy(text)}
              >
                <i className="fa-regular fa-copy"></i>
              </button>
            )}
            <pre className="ai-code-pre">
              <code className={className}>{text}</code>
            </pre>
          </div>
        )
      },
      p: ({node, ...props}) => <p className="ai-paragraph" {...props} />,
      h1: ({node, ...props}) => <h1 className="ai-heading ai-h1 mb-1" {...props} />,
      h2: ({node, ...props}) => <h2 className="ai-heading ai-h2 mb-1" {...props} />,
      h3: ({node, ...props}) => <h3 className="ai-heading ai-h3 mb-1" {...props} />,
      h4: ({node, ...props}) => <h4 className="ai-heading ai-h4 mb-1" {...props} />,
      h5: ({node, ...props}) => <h5 className="ai-heading ai-h5 mb-1" {...props} />,
      h6: ({node, ...props}) => <h6 className="ai-heading ai-h6 mb-1" {...props} />,
      ul: ({node, ...props}) => <ul className="ai-list ai-list-unordered" {...props} />,
      ol: ({node, ...props}) => <ol className="ai-list ai-list-ordered" {...props} />,
      li: ({node, ordered, ...props}) => <li className="ai-list-item" {...props} />,
      a: ({node, ...props}) => <a className="ai-link" target="_blank" rel="noopener noreferrer" {...props} />,
      blockquote: ({node, ...props}) => <blockquote className="ai-blockquote" {...props} />,
      table: ({node, ...props}) => (
        <div className="ai-table-wrapper">
          <table className="ai-table" {...props} />
        </div>
      ),
      thead: ({node, ...props}) => <thead className="ai-table-head" {...props} />,
      tbody: ({node, ...props}) => <tbody className="ai-table-body" {...props} />,
      tr: ({node, ...props}) => <tr className="ai-table-row" {...props} />,
      th: ({node, ...props}) => <th className="ai-table-header-cell" {...props} />,
      td: ({node, ...props}) => <td className="ai-table-cell" {...props} />,
      hr: ({node, ...props}) => <hr className="ai-divider" {...props} />,
      strong: ({node, ...props}) => <strong className="ai-strong" {...props} />,
      em: ({node, ...props}) => <em className="ai-emphasis" {...props} />
    }}
  >
    {markDownContent}
  </ReactMarkdown>
}
