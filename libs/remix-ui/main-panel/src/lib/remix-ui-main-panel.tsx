import React, { useEffect, useState } from 'react' // eslint-disable-line
import './remix-ui-main-panel.module.css';

/* eslint-disable-next-line */
export interface RemixUiMainPanelProps {
  plugin: any
}

export const RemixUiMainPanel = (props: RemixUiMainPanelProps) =>  {
   const darkTheme = ['Dark', 'Black', 'Cyborg']

   const [invertNumber, setInvertNumber] = useState(0)
   
   const handlePluginCall = (pluginName: string) => {
      props.plugin.call('menuicons', 'select', pluginName)
      props.plugin.call(pluginName, pluginName, '')
   }



  return (
    <div className="plugItIn_2byTty" style={{ display: "block" }}>
       {console.log({ props })}
    <div data-id="landingPageHomeContainer" className="homeContainer d-flex" style={{ height: "100%", width: "100%", border: "0px", display: "block" }}>
            <div className="mainContent_2A2Ew bg-light">
          <div className="d-flex justify-content-between">
             <div className="d-flex flex-column">
                <div className="border-bottom d-flex justify-content-between clearfix py-3 mb-4">
                   <div className="mx-4 w-100 d-flex">
                      <img src="assets/img/guitarRemiCroped.webp" className="m-4 logoImg_2A2Ew" style={{ filter:  `invert(${invertNumber})`}}/>
                      <audio id="remiAudio" src="assets/audio/remiGuitar-single-power-chord-A-minor.wav"></audio>
                      <div className="w-80 pl-5 ml-5">
                         <h5 className="mb-1">Quicklinks</h5>
                         <a target="__blank" href="https://medium.com/remix-ide/migrating-files-to-workspaces-8e34737c751c?source=friends_link&amp;sk=b75cfd9093aa23c78be13cce49e4a5e8" className="text_2A2Ew mr-1">Guide</a>for migrating the old File System
                         <p className="font-weight-bold mb-0 py-1">Migration tools:</p>
                         <li className="pl-1">
                            <span className="pl-0"><u className="text_2A2Ew pr-1">Basic migration</u></span>
                         </li>
                         <li className="pl-1"><u className="text_2A2Ew pr-1">Download all Files</u> as a backup zip</li>
                         <li className="pl-1"><u className="text_2A2Ew pr-1">Restore files</u>from backup zip</li>
                         <p className="font-weight-bold mb-0 mt-2">Help:</p>
                         <div className="d-flex flex-column mt-1 pl-0"><a target="__blank" href="https://gitter.im/ethereum/remix" className="text_2A2Ew mx-1">Gitter channel</a> <a target="__blank" href="https://github.com/ethereum/remix-project/issues" className="text_2A2Ew mx-1">Report on Github</a></div>
                      </div>
                   </div>
                </div>
                <div data-id="landingPageHpSections" className="row hpSections_2A2Ew mx-4">
                   <div className="ml-3">
                      <div className="plugins mb-5">
                         <h4>Featured Plugins</h4>
                         <div className="d-flex flex-row pt-2">
                           <button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick = {() => handlePluginCall('solidity') }>
                             <img src="assets/img/solidityLogo.webp" className="m-2 align-self-center envLogo_2A2Ew text-dark" alt='Solidity' style={{ filter: `invert(${invertNumber})` }}/>
                             <label className="text-uppercase text-dark cursorStyle_2A2Ew">Solidity</label>
                           </button>
                           <button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick={() => handlePluginCall('optimism-compiler') }> 
                             <img id="optimismLogo" src="assets/img/optimismLogo.webp" className="m-2 align-self-center envLogo_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/>
                             <label className="text-uppercase text-dark cursorStyle_2A2Ew">Optimism</label>
                           </button>
                           <button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick={() => handlePluginCall('LearnEth') }>
                             <img id="learnEthLogo" src="assets/img/learnEthLogo.webp" className="m-2 align-self-center envLogo_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/>
                               <label className="text-uppercase text-dark cursorStyle_2A2Ew">LearnEth</label>
                            </button>
                            <button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick={() => handlePluginCall('solhint') }>
                              <img id="solhintLogo" src="assets/img/solhintLogo.png" className="m-2 align-self-center envLogo_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/>
                              <label className="text-uppercase text-dark cursorStyle_2A2Ew">Solhint linter</label>
                            </button><button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick={() => handlePluginCall('source-verification') }>
                              <img id="sourcifyLogo" src="assets/img/sourcifyLogo.webp" className="m-2 align-self-center envLogo_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/>
                                <label className="text-uppercase text-dark cursorStyle_2A2Ew">Sourcify</label>
                            </button> 
                            <button data-id="landingPageStartSolidity" className="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center envButton_2A2Ew" onClick={() => handlePluginCall('pluginManager') }>
                              <img id="moreLogo" src="assets/img/moreLogo.webp" className="m-2 align-self-center envLogo_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/>
                                <label className="text-uppercase text-dark cursorStyle_2A2Ew">More</label>
                            </button>
                          </div>
                      </div>
                      <div className="d-flex">
                         <div className="file">
                            <h4>File</h4>
                            <p className="mb-1"><i className="mr-1 far fa-file"></i> <span className="ml-1 mb-1 text_2A2Ew">New File</span></p>
                            <p className="mb-1"><i className="mr-1 far fa-file-alt"></i> <label className="ml-1 labelIt_2A2Ew bigLabelSize_2A2Ew text_2A2Ew">Open Files <input title="open file" type="file" multiple /></label></p>
                            <p className="mb-1"><i className="far fa-hdd"></i> <span className="ml-1 text_2A2Ew">Connect to Localhost</span></p>
                            <p className="mt-3 mb-0"><label>LOAD FROM:</label></p>
                            <div className="btn-group"><button data-id="landingPageImportFromGistButton" className="btn mr-1 btn-secondary">Gist</button><button className="btn mx-1 btn-secondary">GitHub</button><button className="btn mx-1 btn-secondary">Ipfs</button><button className="btn mx-1 btn-secondary">https</button></div>
                            {/* <!-- end of btn-group --> */}
                         </div>
                         {/* <!-- end of div.file --> */}
                         <div className="ml-4 pl-4">
                            <h4>Resources</h4>
                            <p className="mb-1"><i className="mr-1 fas fa-book"></i> <a target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#" className="text_2A2Ew">Documentation</a></p>
                            <p className="mb-1"><i className="mr-1 fab fa-gitter"></i> <a target="__blank" href="https://gitter.im/ethereum/remix" className="text_2A2Ew">Gitter channel</a></p>
                            <p className="mb-1"><img id="remixHhomeWebsite" src="assets/img/remixLogo.webp" className="mr-1 image_2A2Ew" style={{ filter: `invert(${invertNumber})` }}/><a target="__blank" href="https://remix-project.org" className="text_2A2Ew">Featuring website</a></p>
                            <p className="mb-1"><i className="fab fa-ethereum image_2A2Ew"></i> <span className="text_2A2Ew">Old experience</span></p>
                         </div>
                      </div>
                   </div>
                </div>
                {/* <!-- end of hpSections --> */}
             </div>
             <div className="d-flex flex-column rightPanel_2A2Ew">
                <div id="remixIDEMediaPanelsTitle" className="d-flex pr-3 py-2 align-self-end"><button id="remixIDEHomeTwitterbtn" className="btn-info p-2 m-1 border rounded-circle mediaBadge_2A2Ew fab fa-twitter"></button><button id="remixIDEHomeMediumbtn" className="btn-danger p-2 m-1 border rounded-circle mediaBadge_2A2Ew fab fa-medium"></button></div>
                <div id="remixIDEMediaPanels" className="mr-3 d-flex bg-light panels_2A2Ew">
                   <div id="remixIDE_MediumBlock" className="p-2 mx-0 mb-0 d-none remixHomeMedia_2A2Ew" style={{ maxHeight: "514px" }}>
                      <div id="medium-widget" className="p-3 media_2A2Ew">
                         <div id="retainable-rss-embed" data-rss="https://medium.com/feed/remix-ide" data-maxcols="1" data-layout="grid" data-poststyle="external" data-readmore="More..." data-buttonclassName="btn mb-3" data-offset="-100"> -</div>
                      </div>
                   </div>
                   <div id="remixIDE_TwitterBlock" className="p-2 mx-0 mb-0 d-none remixHomeMedia_2A2Ew" style={{ maxHeight: "514px" }}>
                      <div className="px-2 media_2A2Ew">
                         <a data-width="350" data-theme="dark" data-chrome="nofooter noheader transparent" data-tweet-limit="8" href="https://twitter.com/EthereumRemix" className="twitter-timeline"></a>
                         {/* <script async="async" src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
 </div>
  );
}

export default RemixUiMainPanel;
