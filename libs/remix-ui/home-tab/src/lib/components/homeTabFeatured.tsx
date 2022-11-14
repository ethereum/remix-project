/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
const _paq = window._paq = window._paq || [] // eslint-disable-line

function HomeTabFeatured() {
  const themeFilter = useContext(ThemeContext)

  return (
    <div className="pt-3 pl-2" id="hTFeaturedeSection">
      <label style={{ fontSize: "1.2rem" }}>Featured</label>
      <div className="mb-2">
        <div className="w-100 d-flex flex-column" style={{ height: "200px" }}>
          <ThemeContext.Provider value={themeFilter}>
            <Carousel
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{ desktop: { breakpoint: { max: 2000, min: 1024 }, items: 1 } }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              partialVisible={false}
              centerMode={false}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border w-full carousel-container"
              sliderClass="h-100 justify-content-between"
              deviceType={"desktop"}
              itemClass=""
              autoPlaySpeed={15000}
              dotListClass="position-relative mt-2"
            >
              <div className="mx-1 px-1 d-flex">
                <img src={"assets/img/bgRemi.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 w-50 p-4" style={{ flex: "1" }}>
                  <h5>JUMP INTO WEB3</h5>
                  <p>The Remix Project is a rich toolset which can be used for the entire journey of contract development by users of any knowledge level, and as a learning lab for teaching and experimenting with Ethereum.</p>
                  <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'jumpIntoWeb3'])} target="__blank" href="https://remix-project.org">More</a>
                </div>
              </div>
              <div className="mx-1 px-1 d-flex">
                <img src={"/assets/img/remixRewardUser.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1" }}>
                  <h5>REMIX REWARDS</h5>
                  <p style={{ fontStyle: 'italic' }}>NFTs for our users!</p>
                  <p>
                    Remix Project rewards contributors, beta testers, and UX research participants with NFTs deployed on Optimism. Remix Reward holders are able to mint a second “Remixer” user NFT badge to give to any other user of their choice.
                  </p>
                  <a className="remixui_home_text" target="__blank" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'remixRewards'])} href="https://rewards.remix.ethereum.eth.limo">More</a>
                </div>
              </div>
              <div className="mx-1 px-1 d-flex">
                <img src={"/assets/img/remixRewardBetaTester.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1" }}>
                  <h5>BETA TESTING</h5>
                  <p style={{ fontStyle: 'italic' }}>Our community supports us.</p>
                  <p>You can join Beta Testing before each release of Remix IDE. Help us test now and get a handle on new features!</p>
                  <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'betatesting'])} target="__blank" href="https://rewards.remix.ethereum.eth.limo">More</a>
                </div>
              </div>
            </Carousel>
          </ThemeContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default HomeTabFeatured
