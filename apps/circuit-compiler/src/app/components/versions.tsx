import { AppState } from "../types";
import { Dropdown } from "react-bootstrap";
import React, { Ref } from "react";

export function VersionList ({ currentVersion, versionList, setVersion }: { versionList: AppState['versionList'], currentVersion: string, setVersion: (version: string) => void }) {
  const versionListKeys = Object.keys(versionList)
  return (
    <Dropdown>
      <Dropdown.Toggle as={CircomVersionMenuToggle} id="circomVersionList" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control">
        <div style={{ flexGrow: 1, overflow: 'hidden', display:'flex', justifyContent:'left' }}>
          { versionList[currentVersion].name }
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu as={CircomVersionMenu} className="w-100 custom-dropdown-items overflow-hidden">
        {
          versionListKeys.map((version, index) => (
            <Dropdown.Item key={index} onClick={() => {
              setVersion(version)
            }}>
              <div className='d-flex w-100 justify-content-between'>
                <div className="text-truncate">
                  { versionList[version].name }
                </div>
              </div>
            </Dropdown.Item>
          ))
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

const CircomVersionMenuToggle = React.forwardRef(
  (
    {
      children,
      onClick,
      className = ''
    }: {
      children: React.ReactNode
      onClick: (e) => void
      className: string
    },
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
      }}
      className={className.replace('dropdown-toggle', '')}
    >
      <div className="d-flex">
        {children}
        <div>
          <i className="fad fa-sort-circle"></i>
        </div>
      </div>
    </button>
  )
)

const CircomVersionMenu = React.forwardRef(
  (
    {
      children,
      style,
      'data-id': dataId,
      className,
      'aria-labelledby': labeledBy
    }: {
      'children': React.ReactNode
      'style'?: React.CSSProperties
      'data-id'?: string
      'className': string
      'aria-labelledby'?: string
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const height = window.innerHeight * 0.6
    return (
      <div ref={ref} style={style} className={className} aria-labelledby={labeledBy} data-id={dataId}>
        <ul className="list-unstyled mb-0" style={{ maxHeight: height + 'px',overflowY:'auto' }}>
          {children}
        </ul>
      </div>
    )
  }
)

// export const CompilerDropdown = (props: compilerDropdownProps) => {
//   const online = useContext(onLineContext)
//   const platform = useContext(platformContext)
//   const { customVersions, selectedVersion, defaultVersion, allversions, handleLoadVersion, _shouldBeAdded, onlyDownloaded } = props
//   return (
//     <Dropdown id="versionSelector" data-id="versionSelector">
//       <Dropdown.Toggle as={CompilerMenuToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
//         <div style={{ flexGrow: 1, overflow: 'hidden', display:'flex', justifyContent:'left' }}>
//           <div className="text-truncate">
//             {customVersions.map((url, i) => {
//               if (selectedVersion === url) return (<span data-id="selectedVersion" key={i}>custom</span>)
//             })}
//             {allversions.map((build, i) => {

//               if ((selectedVersion || defaultVersion) === build.path) {
//                 return (<span data-id="selectedVersion" key={i}>{build.longVersion}</span>)
//               }
//             })}
//           </div>
//         </div>
//       </Dropdown.Toggle>

//       <Dropdown.Menu as={CompilerMenu} className="w-100 custom-dropdown-items overflow-hidden" data-id="custom-dropdown-items">
//         {allversions.length <= 0 && (
//           <Dropdown.Item
//             key={`default`}
//             data-id='builtin'
//             onClick={() => {}}
//           >
//             <div className='d-flex w-100 justify-content-between'>
//               {selectedVersion === defaultVersion ? <span className='fas fa-check text-success mr-2'></span> : null}
//               <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//                 <div className="text-truncate">
//                   {defaultVersion}
//                 </div>
//               </div>
//             </div>
//           </Dropdown.Item>
//         )}
//         {allversions.length <= 0 && (
//           <Dropdown.Item
//             key={`builtin`}
//             data-id='builtin'
//             onClick={() => {}}
//           >
//             <div className='d-flex w-100 justify-content-between'>
//               {selectedVersion === "builtin" ? <span className='fas fa-check text-success mr-2'></span> : null}
//               <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//                 <div className="text-truncate">
//                   builtin
//                 </div>
//               </div>
//             </div>
//           </Dropdown.Item>
//         )}
//         {customVersions.map((url, i) => (
//           <Dropdown.Item
//             key={`custom-${i}`}
//             data-id={`dropdown-item-${url}`}
//             onClick={() => handleLoadVersion(url)}
//           >
//             <div className='d-flex w-100 justify-content-between'>
//               {selectedVersion === url ? <span className='fas fa-check text-success mr-2'></span> : null}
//               <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//                 <div className="text-truncate">
//                   custom: {url}
//                 </div>
//               </div>
//             </div>
//           </Dropdown.Item>
//         ))}
//         {allversions.map((build, i) => {
//           if (onlyDownloaded && !build.isDownloaded) return null
//           return _shouldBeAdded(build.longVersion) ? (
//             <Dropdown.Item
//               key={`soljson-${i}`}
//               data-id={`dropdown-item-${build.path}`}
//               onClick={() => handleLoadVersion(build.path)}
//             >
//               <div className='d-flex w-100 justify-content-between'>
//                 {selectedVersion === build.path ? <span className='fas fa-check text-success mr-2'></span> : null}
//                 <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//                   <div className="text-truncate">
//                     {build.longVersion}
//                   </div>
//                 </div>
//                 {platform == appPlatformTypes.desktop ? (build.isDownloaded ? <div className='fas fa-arrow-circle-down text-success ml-auto'></div> : <div className='far fa-arrow-circle-down'></div>) : null}
//               </div>
//             </Dropdown.Item>
//           ) : null
//         })}
//       </Dropdown.Menu>
//     </Dropdown>
//   );
