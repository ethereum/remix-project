import React from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useAppSelector } from '../../redux/hooks'
import RepoImporter from '../../components/RepoImporter'
import './index.css'

function HomePage(): JSX.Element {
  const [openKeys, setOpenKeys] = React.useState<string[]>([])

  const isOpen = (key: string) => openKeys.includes(key)
  const handleClick = (key: string) => {
    setOpenKeys(isOpen(key) ? openKeys.filter((item) => item !== key) : [...openKeys, key])
  }

  const { list, detail, selectedId } = useAppSelector((state) => state.workshop)

  const selectedRepo = detail[selectedId]

  const levelMap: any = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
  }

  return (
    <div className="App">
      <RepoImporter list={list} selectedRepo={selectedRepo || {}} />
      {selectedRepo && (
        <div className="container-fluid">
          {Object.keys(selectedRepo.group).map((level) => (
            <div key={level}>
              <div className="mb-2 border-bottom small">{levelMap[level]}:</div>
              {selectedRepo.group[level].map((item: any) => (
                <div key={item.id}>
                  <div>
                    <span
                      className="arrow-icon"
                      onClick={() => {
                        handleClick(item.id)
                      }}
                    >
                      <i className={`fas fa-xs ${isOpen(item.id) ? 'fa-chevron-down' : 'fa-chevron-right'}`} />
                    </span>
                    <span
                      className="workshop-link"
                      onClick={() => {
                        handleClick(item.id)
                      }}
                    >
                      {selectedRepo.entities[item.id].name}
                    </span>
                    <Link onClick={() => (window as any)._paq.push(['trackEvent', 'learneth', 'start_workshop', selectedRepo.entities[item.id].name])} to={`/list?id=${item.id}`} className="text-decoration-none float-right">
                      <i className="fas fa-play-circle fa-lg" />
                    </Link>
                  </div>
                  <div className={`container-fluid bg-light pt-3 mt-2 ${isOpen(item.id) ? '' : 'description-collapsed'}`}>
                    {levelMap[level] && <p className="tag pt-2 pr-1 font-weight-bold small text-uppercase">{levelMap[level]}</p>}

                    {selectedRepo.entities[item.id].metadata.data.tags?.map((tag: string) => (
                      <p key={tag} className="tag pr-1 font-weight-bold small text-uppercase">
                        {tag}
                      </p>
                    ))}

                    {selectedRepo.entities[item.id].steps && <div className="d-none">{selectedRepo.entities[item.id].steps.length} step(s)</div>}

                    <div className="workshop-list_description pb-3 pt-3">
                      <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                        {selectedRepo.entities[item.id].description?.content}
                      </Markdown>
                    </div>

                    <div className="actions"></div>
                  </div>
                  <div className="mb-3"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
